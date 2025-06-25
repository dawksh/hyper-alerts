import { Elysia } from 'elysia'
import { getUserPositions, setAlert, addUser } from '../controllers/userController'

export const userRoutes = (app: Elysia) =>
    app
        .group('/user', (app) =>
            app
                .get('/user-positions', async ({ query }) => {

                    return []
                })
                .post('/set-alert', setAlert)
                .post('/add-user', addUser)
        )