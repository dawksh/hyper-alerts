import { Elysia } from 'elysia'

export const utilRoutes = (app: Elysia) =>
    app
        .get('/health', () => ({ status: 'ok' }))
        .get('/ping', () => ({ message: 'pong' }))