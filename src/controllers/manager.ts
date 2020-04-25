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
	Redis.getInstance.hgetallAsync('orders').then((orders) => {
		res.json(orders)
	}).catch((reason) => {
		next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'GET /manager/orders', true))
	})
})

router.get('/order/:id', (req, res, next) => {
	Redis.getInstance.hgetAsync('orders', req.params.id).then((order) => {
		res.json(JSON.parse(order))
	}).catch((reason) => {
		next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'GET /manager/order/:id', true))
	})
})

router.put('/orders/cancel/:id', (req, res, next) => {
	Redis.getInstance.hgetAsync('orders', req.params.id).then((order) => {
		Redis.getInstance.hsetAsync('orders', req.params.id, JSON.stringify(Object.assign(JSON.parse(order), { status: false }))).then(() => {
			res.json(Object.assign(JSON.parse(order), { status: false }))
		}).catch((reason) => {
			// sendSms(JSON.parse(order).phoneNumber, '21:26 25/03/2020 Tarihinde verdiğiniz. X Siparişi, Y nedeniyle iptal edilmiştir. Ödemeniz en kısa sürece hesabına geri aktarılacaktır. Anlayışınız için teşekkürler.')
			next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'GET /manager/order/:id', true))
		})
	}).catch((reason) => {
		next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /orders/cancel/:id', true))
	})
})

router.put('/orders/confirm/:id', (req, res, next) => {
	Redis.getInstance.hgetAsync('orders', req.params.id).then((order) => {
		Redis.getInstance.hsetAsync('orders', req.params.id, JSON.stringify(Object.assign(JSON.parse(order), { status: true }))).then(() => {
			// sendSms(JSON.parse(order).phoneNumber, '21:26 25/03/2020 Tarihinde verdiğiniz. X Siparişi, X Kargoya verilmiştir, Kargo takip numarası : 0123456789')
			res.json(Object.assign(JSON.parse(order), { status: true }))
		}).catch((reason) => {
			next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /orders/confirm/:id', true))
		})
	}).catch((reason) => {
		next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /orders/confirm/:id', true))
	})
})

export default router