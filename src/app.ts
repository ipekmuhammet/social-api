import express from 'express'

import {
	middlewares, Mongo, Redis, Elasticsearch
} from './startup'
import controller from './controllers'
import errorHandlerMiddleware from './middlewares/error-handler-middleware'

const app = express()

middlewares(app)
Mongo.connect(process.env.DB_HOST)
Elasticsearch.connect(process.env.ES_HOST)
Redis.connect(process.env.REDIS_HOST)

app.use('/', controller)
app.use(errorHandlerMiddleware)

export default app