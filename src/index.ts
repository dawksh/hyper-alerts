import { Elysia } from 'elysia'
import { logger } from './middleware/logger'
import { userRoutes } from './routes/userRoutes'

userRoutes(logger(new Elysia())).listen(3000) 