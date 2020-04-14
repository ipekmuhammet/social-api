import express from 'express'

import {
	middlewares, Mongo, Redis, Elasticsearch
} from './startup'
import controller from './controllers'

import { prepareElasticsearch, prepareRedis } from './temp_data'

const app = express()

middlewares(app)
Mongo.connect(process.env.DB_HOST)
Elasticsearch.connect(process.env.ES_HOST)
Redis.connect(process.env.REDIS_HOST)

// prepareRedis()
// prepareElasticsearch()

app.use('/', controller)

export default app