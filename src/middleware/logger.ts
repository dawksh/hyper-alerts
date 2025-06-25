import { Elysia } from 'elysia'
import logger from '../lib/logger'

export const loggerMiddleware = (app: Elysia) =>
    app.onRequest(async ({ request }) =>
        logger.info(
            `📥 ${request.method} ${request.url}` +
            (request.headers ? `\nHeaders: ${JSON.stringify(Object.fromEntries(request.headers))}` : '') +
            (request.body ? `\nBody: ${JSON.stringify(await request.clone().json().catch(() => undefined))}` : '')
        )
    )