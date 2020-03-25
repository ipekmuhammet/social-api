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

router.put('/orders/cancel/:id', (req, res) => {
	Redis.getInstance.hget('category1', req.params.id, (err0, reply0) => {
		Redis.getInstance.hset('category1', req.params.id, JSON.stringify(Object.assign(JSON.parse(reply0), { status: false })), (err, reply) => {
			if (err) {
				res.json({ status: false })
			} else {
				res.json({ status: true })
			}
		})
	})
})

router.put('/orders/confirm/:id', (req, res) => {
	Redis.getInstance.hget('category1', req.params.id, (err0, reply0) => {
		Redis.getInstance.hset('category1', req.params.id, JSON.stringify(Object.assign(JSON.parse(reply0), { status: true })), (err, reply) => {
			if (err) {
				res.json({ status: false })
			} else {
				res.json({ status: true })
			}
		})
	})
})

export default router