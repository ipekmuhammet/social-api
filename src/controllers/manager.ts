import HttpStatusCodes from 'http-status-codes'
import { Router } from 'express'
import Nexmo from 'nexmo'

import { Redis } from '../startup'
import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import ServerError from '../errors/ServerError'
import { getOrderById, updateOrderStatus, saveOrderToCache } from '../services/manager'

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
	// Redis.getInstance.del('orders')
	Redis.getInstance.hgetallAsync('orders').then((orders) => {
		res.json(orders ?? {})
	}).catch((reason) => {
		next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'GET /manager/orders', true))
	})
})

router.get('/order/:_id', (req, res, next) => {
	getOrderById(req.params._id).then((order) => {
		res.json(JSON.parse(order))
	}).catch((reason) => {
		next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'GET /manager/order/:_id', true))
	})
})

router.put('/orders/cancel/:_id', (req, res, next) => {
	updateOrderStatus(req.params._id, false)
		.then((order) => saveOrderToCache(order).then(() => order))
		.then((order) => {
			// sendSms(JSON.parse(order).phoneNumber, '21:26 25/03/2020 Tarihinde verdiğiniz. X Siparişi, Y nedeniyle iptal edilmiştir. Ödemeniz en kısa sürece hesabına geri aktarılacaktır. Anlayışınız için teşekkürler.')
			res.json(order)
		}).catch((reason) => {
			next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /orders/confirm/:_id', true))
		})
})

router.put('/orders/confirm/:_id', (req, res, next) => {
	updateOrderStatus(req.params._id, true)
		.then((order) => saveOrderToCache(order).then(() => order))
		.then((order) => {
			// sendSms(JSON.parse(order).phoneNumber, '21:26 25/03/2020 Tarihinde verdiğiniz. X Siparişi, X Kargoya verilmiştir, Kargo takip numarası : 0123456789')
			res.json(order)
		}).catch((reason) => {
			next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /orders/confirm/:_id', true))
		})
})

export default router