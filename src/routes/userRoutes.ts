import { Elysia, t } from 'elysia'
import { getUserPositions, setAlert, addUser, getAlerts } from '../controllers/userController'
import { Direction } from '../lib/constants'

export const userRoutes = (app: Elysia) =>
    app
        .group('/user', (app) =>
            app
                .get('/user-positions', getUserPositions, {
                    query: t.Object({
                        wallet: t.String(),
                    }),
                })
                .get('/alerts', getAlerts, {
                    query: t.Object({
                        wallet: t.String(),
                    }),
                })
                .post('/set-alert', setAlert, {
                    body: t.Object({
                        asset: t.String(),
                        liqPrice: t.Number(),
                        address: t.String(),
                        direction: t.String({
                            enum: Object.values(Direction),
                        }),
                    }),
                })
                .post('/add-user', addUser, {
                    body: t.Object({
                        address: t.String(),
                        pdId: t.String(),
                        telegramId: t.String(),
                        email: t.String(),
                    }),
                })
        )