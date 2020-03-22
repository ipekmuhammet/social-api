import express from 'express'

import {
	middlewares, Mongo, Redis, Elasticsearch
} from './startup'
import controller from './controllers'

import categories from '../temp_data/categories.json'
import products from '../temp_data/products.json'


const app = express()

middlewares(app)
Mongo.connect(process.env.DB_HOST)
Elasticsearch.connect(process.env.ES_HOST)
Redis.connect(process.env.REDIS_HOST)

const prepareDatas = () => {
	const x = Redis.getInstance.multi()

	// x.setAsync('categories', JSON.stringify(categories))

	categories.map((category: any) => {
		x.hset('productsx', category.Id, JSON.stringify(Object.values(products.filter((product: any) => product.categoryId === category.Id))))
	})

	x.exec((err) => {
		console.log('err', err)
	})

}
prepareDatas()

app.use('/', controller)

export default app