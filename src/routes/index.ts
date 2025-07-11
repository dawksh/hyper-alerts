import { Elysia } from 'elysia'
import { utilRoutes } from './utilRoutes'
import { userRoutes } from './userRoutes'
import { stripeRoutes } from './stripe'
import { webhookRoutes } from './webhook'

export const routes = (app: Elysia) =>
    app
        .use(utilRoutes)
        .use(userRoutes)
        .use(stripeRoutes)
        .use(webhookRoutes)