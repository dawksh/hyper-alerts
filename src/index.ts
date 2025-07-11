import { Elysia } from "elysia";
import { env } from "./lib/env";
import { routes } from "./routes";
import logger from "./lib/logger";
import bot from "./lib/telegram";
import "./cron";

const app = new Elysia();

routes(app);

app.onRequest(async ({ request }) => {
    logger.info(
        `📥 ${request.method} ${request.url}` +
        (request.headers
            ? `\nHeaders: ${JSON.stringify(
                Object.fromEntries(request.headers)
            )}`
            : "") 
    );
});

bot.startPolling();
app.listen(env.PORT, () => console.log(`listening on ${env.PORT}`));
