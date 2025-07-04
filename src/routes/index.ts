import { Elysia } from 'elysia'
import { utilRoutes } from './utilRoutes'
import { userRoutes } from './userRoutes'
import { stripeRoutes } from './stripe'

export const routes = (app: Elysia) =>
    app
        .use(utilRoutes)
        .use(userRoutes)
        .use(stripeRoutes)