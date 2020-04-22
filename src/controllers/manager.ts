import HttpStatusCodes from 'http-status-codes'
import { Router } from 'express'
import Nexmo from 'nexmo'

import { Redis } from '../startup'
import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import ServerError from '../errors/ServerError'

const router = Router()

router.use(validateAuthority(Authority.MANAGER))

// eslint-disable-next-line no-unused-vars
const sendSms = (to: string, message: string) => {
	const smsManager: any = new Nexmo({
		apiKey: '14efe668',
		apiSecret: 'ivcyJQr7tWmvT4yP',
	})

	const from = 'Platform app'

	smsManager.message.sendSms(from, to, message)
}

router.get('/orders', (req, res, next) => {
	// Redis.getInstance.del('orders', Object.keys(Redis.getInstance.hgetall('orders')))
	Redis.getInstance.hgetall('orders', (error, reply) => {
		if (!error) {
			res.json(reply)
		} else {
			next(new ServerError(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'GET /manager/orders', true))
		}
	})
})

router.get('/order/:id', (req, res, next) => {
	Redis.getInstance.hget('orders', req.params.id, (error, reply) => {
		if (!error) {
			res.json(JSON.parse(reply))
		} else {
			next(new ServerError(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'GET /manager/order/:id', true))
		}
	})
})

router.put('/orders/cancel/:id', (req, res, next) => {
	Redis.getInstance.hget('orders', req.params.id, (err0, reply0) => {
		if (!err0) {
			next(new ServerError(err0.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /orders/cancel/:id', true))
		} else {
			Redis.getInstance.hset('orders', req.params.id, JSON.stringify(Object.assign(JSON.parse(reply0), { status: false })), (error) => {
				if (!error) {
					res.json({ status: true })
				} else {
					// sendSms('905468133198', '21:26 25/03/2020 Tarihinde verdiğiniz. X Siparişi, Y nedeniyle iptal edilmiştir. Ödemeniz en kısa sürece hesabına geri aktarılacaktır. Anlayışınız için teşekkürler.')
					next(new ServerError(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'GET /manager/order/:id', true))
				}
			})
		}
	})
})

router.put('/orders/confirm/:id', (req, res, next) => {
	Redis.getInstance.hget('orders', req.params.id, (err0, reply0) => {
		if (!err0) {
			next(new ServerError(err0.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /orders/confirm/:id', true))
		} else {
			Redis.getInstance.hset('orders', req.params.id, JSON.stringify(Object.assign(JSON.parse(reply0), { status: true })), (error) => {
				if (error) {
					next(new ServerError(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /orders/confirm/:id', true))
				} else {
					// sendSms('905468133198', '21:26 25/03/2020 Tarihinde verdiğiniz. X Siparişi, X Kargoya verilmiştir, Kargo takip numarası : 0123456789')
					res.json({ status: true })
				}
			})
		}
	})
})

export default router