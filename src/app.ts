import express from 'express'

import {
	middlewares, Mongo, Redis, Elasticsearch
} from './startup'

const app = express()

middlewares(app)
Mongo.connect(process.env.DB_HOST)
Elasticsearch.connect(process.env.ES_HOST)
Redis.connect(process.env.REDIS_HOST)

app.get('/', (req, res) => {
	console.log(req.body)
	res.end('sa')
})

export default app