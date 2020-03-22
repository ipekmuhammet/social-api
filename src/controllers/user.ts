import { Router } from 'express'
import { Redis } from '../startup'

const router = Router()

router.get('/categories', (req, res) => {
	Redis.getInstance.getAsync('categories').then((val: any) => {
		res.json(JSON.parse(val))
	})
})

router.get('/products', (req, res) => {
	Redis.getInstance.hgetall('productsx', (err: any, obj: any) => {
		res.json(obj)
	})
})

router.get('/productsByCategoryId', (req, res) => {
	Redis.getInstance.hget('productsx', req.body.categoryId, (err: any, obj: any) => {
		res.json(JSON.parse(obj))
	})
})

export default router