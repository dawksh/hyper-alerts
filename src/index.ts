import { Elysia } from 'elysia'
import { loggerMiddleware } from './middleware/logger'
import { env } from './lib/env'
import { routes } from './routes'

routes(loggerMiddleware(new Elysia())).listen(env.PORT, () => console.log(`listening on ${env.PORT}`))