import prisma from "../lib/prisma";
import logger from "../lib/logger";
import { fetchPrices } from "../lib/hl";
import bot from "../lib/telegram";
import { sendMessage } from "../lib/twilio";

let lastPrices: Record<string, number> = {};

const COOLDOWN = 1000 * 60 * 10;

const checkAlerts = async () => {
  try {
    const prices = await fetchPrices();
    lastPrices = prices;
    const alerts = await prisma.alert.findMany({
      where: {
        acknowledged: false,
        OR: [
          { last_alert: { lt: new Date(Date.now() - COOLDOWN) } },
          { last_alert: null, createdAt: { lt: new Date(Date.now() - COOLDOWN) } },
        ],
      },
      include: {
        user: {
          include: {
            credits: true,
          },
        },
      },
    });

    const nearLiq = alerts.filter((a) => {
      const price = prices[a.coin];
      if (!price) return false;
      return Math.abs(price - a.liq_price) / a.liq_price <= a.user.threshold;
    });

    logger.info(`Unacknowledged near-liq alerts: ${nearLiq.length}`);

    nearLiq.forEach(async (a) => {
      const user = a.user;
      if (!user.telegram_id && !user.pd_id) return;
      const price = prices[a.coin];
      if (price === undefined) return;
      const percentAway = ((price - a.liq_price) / a.liq_price) * 100;
      const now = new Date().toISOString();
      await prisma.alert.update({
        where: { id: a.id },
        data: { last_alert: new Date() },
      });
      if (user.telegram_id) {
        bot.sendMessage(
          user.telegram_id,
          `Alert for ${a.coin}\nTime: ${now}\nCurrent: ${price}\nLiq: ${
            a.liq_price
          }\n% Away: ${percentAway.toFixed(2)}%`
        );
      }
      if (user.pd_id && user.credits[0]?.credits && user.credits[0]?.credits > 0) {
        await prisma.alert.update({
          where: { id: a.id },
          data: { last_alert: new Date(), last_price: price},
        });
        await prisma.credits.update({
          where: { user_id: user.id },
          data: { credits: { decrement: 1 } },
        });
        sendMessage(
          user.pd_id,
          `This call is to remind you that your liquidation price for ${
            a.coin
          } is ${Math.abs(percentAway).toFixed(
            2
          )}% away from the current price of ${price}. Please take action to avoid liquidation`,
          a.id
        );
      }
    });
  } catch (e) {
    logger.error(e);
  }
};

setInterval(checkAlerts, 5000);
