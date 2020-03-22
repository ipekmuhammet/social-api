import express from 'express'

import {
	middlewares, mongo, redis, elasticsearch
} from './startup'

const app = express()
middlewares(app)
mongo()
elasticsearch()
const redisClient = redis()

app.get('/', (req, res) => {
	console.log(req.body)
	res.end('sa')
})

export default app