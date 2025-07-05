import prisma from "../lib/prisma";
import logger from "../lib/logger";
import { fetchPrices } from "../lib/hl";
import bot from "../lib/telegram";
import { sendMessage } from "../lib/twilio";
import { enqueueBatch } from "../lib/queue";

const COOLDOWN = 1000 * 60 * 5;

const checkAlerts = async () => {
    try {
        const prices = await fetchPrices();
        const alerts = await prisma.alert.findMany({
            where: {
                acknowledged: false,
                last_alert: { lt: new Date(Date.now() - COOLDOWN) },
                user: {
                    credits: {
                        some: {
                            credits: {
                                gt: 0
                            }
                        }
                    }
                }
            },
            include: { user: true },
        });
        const nearLiq = alerts.filter((a) => {
            const price = prices[a.coin];
            if (!price) return false;
            return Math.abs(price - a.liq_price) / a.liq_price <= a.user.threshold;
        });
        logger.info(`Unacknowledged near-liq alerts: ${nearLiq.length}`);
        const tasks = nearLiq
            .map((a) => ({ alert: a, price: prices[a.coin] }))
            .filter((t) => typeof t.price === 'number') as { alert: typeof nearLiq[0], price: number }[];
        enqueueBatch(tasks, { telegram: bot, twilio: { sendMessage }, prisma });
    } catch (e) {
        logger.error(e);
    }
};

setInterval(checkAlerts, 5000);
