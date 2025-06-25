import { Elysia } from 'elysia'
import { utilRoutes } from './utilRoutes'
import { userRoutes } from './userRoutes'

export const routes = (app: Elysia) =>
    app
        .use(utilRoutes)
        .use(userRoutes)
