import prisma from "../lib/prisma";
import logger from "../lib/logger";
import { fetchPrices } from "../lib/hl";
import bot from "../lib/telegram";

let lastPrices: Record<string, number> = {};

const COOLDOWN = 1000 * 60 * 10;

const checkAlerts = async () => {
    const prices = await fetchPrices();
    lastPrices = prices;
    const alerts = await prisma.alert.findMany({
        where: {
            acknowledged: false,
            last_alert: { lt: new Date(Date.now() - COOLDOWN) },
        },
        include: { user: true },
    });
    const nearLiq = alerts.filter((a) => {
        const price = prices[a.coin];
        if (!price) return false;
        return Math.abs(price - a.liq_price) / a.liq_price <= 0.2;
    });
    logger.info(`Unacknowledged near-liq alerts: ${nearLiq.length}`);
    nearLiq.forEach(async (a) => {
        const user = a.user;
        if (!user.telegram_id) return;
        const price = prices[a.coin];
        if (price === undefined) return;
        const percentAway = ((price - a.liq_price) / a.liq_price) * 100;
        const now = new Date().toISOString();
        await prisma.alert.update({
            where: { id: a.id },
            data: { last_alert: new Date() },
        });
        bot.sendMessage(
            user.telegram_id,
            `Alert for ${a.coin}\nTime: ${now}\nCurrent: ${price}\nLiq: ${a.liq_price
            }\n% Away: ${percentAway.toFixed(2)}%`
        );
    });
};

setInterval(checkAlerts, 5000);
