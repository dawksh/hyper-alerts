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
                .post('/set-alert', setAlert)
                .post('/add-user', addUser)
        )