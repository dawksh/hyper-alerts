import { Elysia } from 'elysia'

export const logger = (app: Elysia) =>
    app.onRequest(({ request }) => {
        console.log(
            JSON.stringify({
                time: new Date().toISOString(),
                method: request.method,
                url: request.url,
                headers: Object.fromEntries(request.headers.entries())
            }, null, 2)
        )
    }) 