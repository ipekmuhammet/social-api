import { Router } from 'express'

import { Redis } from '../startup'

const router = Router()

router.get('/orders', (req, res) => {
	// Redis.getInstance.del('category1', Object.keys(Redis.getInstance.hgetall('category1')))
	Redis.getInstance.hgetall('category1', (err, reply) => {
		res.json(reply)
	})
})

router.get('/orders/:id', (req, res) => {
	Redis.getInstance.hget('category1', req.params.id, (err, reply) => {
		res.json(JSON.parse(reply))
	})
})

export default router