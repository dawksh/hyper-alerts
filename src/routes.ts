import { Elysia } from 'elysia'

export const routes = (app: Elysia) =>
    app
        .get('/user-positions', ({ query }: { query: Record<string, unknown> }) => [])
        .post('/set-alert', async ({ body }: { body: unknown }) => ({}))
        .post('/add-user', async ({ body }: { body: unknown }) => ({})) 