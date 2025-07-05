const { parentPort, workerData } = require("worker_threads");
(async () => {
    const { task } = workerData;
    const prisma = (await import("../lib/prisma")).default;
    const bot = (await import("../lib/telegram")).default;
    const { sendMessage } = await import("../lib/twilio");
    const { alert: a, price } = task;
    const user = a.user;
    if (!user.telegram_id && !user.pd_id) return parentPort.postMessage("done");
    if (price === undefined) return parentPort.postMessage("done");
    const percentAway = ((price - a.liq_price) / a.liq_price) * 100;
    const now = new Date().toISOString();
    await prisma.alert.update({ where: { id: a.id }, data: { last_alert: new Date() } });
    await prisma.credits.update({ where: { user_id: user.id }, data: { credits: { decrement: 1 } } });
    if (user.telegram_id) bot.sendMessage(user.telegram_id, `Alert for ${a.coin}\nTime: ${now}\nCurrent: ${price}\nLiq: ${a.liq_price}\n% Away: ${percentAway.toFixed(2)}%`);
    if (user.pd_id) sendMessage(user.pd_id, `This call is to remind you that your liquidation price for ${a.coin} is ${Math.abs(percentAway).toFixed(2)}% away from the current price of ${price}. Please take action to avoid liquidation`, a.id);
    parentPort.postMessage("done");
})(); 