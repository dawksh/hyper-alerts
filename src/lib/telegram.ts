import TelegramBot, { type Message } from "node-telegram-bot-api";
import { env } from "./env";
import { redis } from "bun";
import prisma from "./prisma";

const processRegisterCode = (code: string) => code === '' ? 'Invalid code' : `registered: ${code}`;
const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN!);

bot.onText(/\/register$/, (msg: TelegramBot.Message) => {
    bot.sendMessage(msg.chat.id, "Send Register Code")
    const chatId = msg.chat.id;
    bot.once("message", async (m: Message) => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(m.text ?? '');
        if (!isUUID) return bot.sendMessage(chatId, "Invalid code.");
        await prisma.user.update({
            where: {
                telegram_id: m.text?.toString() ?? ''
            },
            data: {
                telegram_id: chatId.toString()
            }
        });
        bot.sendMessage(chatId, `User alerts enabled`);
    });
});
export default bot;
