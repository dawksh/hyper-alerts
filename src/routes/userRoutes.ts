import { Elysia, t } from 'elysia'
import { getUserPositions, setAlert, addUser } from '../controllers/userController'
import hl from '../lib/hl'

export const userRoutes = (app: Elysia) =>
    app
        .group('/user', (app) =>
            app
                .get('/user-positions', getUserPositions, {
                    query: t.Object({
                        wallet: t.String(),
                    }),
                })
                .post('/set-alert', setAlert, {
                    body: t.Object({
                        asset: t.String(),
                        liqPrice: t.Number(),
                        address: t.String(),
                    }),
                })
                .post('/add-user', addUser)
        )