import { Router } from 'express'
import HttpStatusCodes from 'http-status-codes'
import Iyzipay from 'iyzipay'

import { Redis } from '../startup'
import { User } from '../models'
import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import ServerError from '../errors/ServerError'
import Validator from './validator'

const router = Router()

const iyzipay = new Iyzipay({
	apiKey: 'sandbox-hbjzTU7CZDxarIUKVMhWLvHOIMIb3Z40',
	secretKey: 'sandbox-F01xQT4VMHAdFDB4RFNgo2l0kMImhCPX',
	uri: 'https://sandbox-api.iyzipay.com'
})

router.use(validateAuthority(Authority.USER))

router.get('/list-cards', (req, res, next) => {
	iyzipay.cardList.retrieve({
		locale: Iyzipay.LOCALE.TR,
		conversationId: '123456789',
		cardUserKey: 'ojBya0o8ecs7ynou3l94xmdB8f8='
	}, (error: any, result: any) => {
		if (error) {
			next(new ServerError(JSON.stringify(error), HttpStatusCodes.INTERNAL_SERVER_ERROR, 'GET /list-cards', true))
		} else {
			res.json(result)
		}
	})
})

router.post('/payment-card', (req, res, next) => {
	iyzipay.card.create({
		locale: Iyzipay.LOCALE.TR,
		// conversationId: '123456789',
		cardUserKey: 'ojBya0o8ecs7ynou3l94xmdB8f8=', // TODO get from user object from database/redis
		card: req.body.card // Validate card datas	//	{
		//		cardAlias: 'card alias',
		//		cardHolderName: 'John Doe',
		//		cardNumber: '5890040000000016',
		//		expireMonth: '12',
		//		expireYear: '2030'
		//	}
	}, (error: any, result: any) => {
		if (error) {
			next(new ServerError(JSON.stringify(error), HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /payment-card', true))
		} else {
			res.json(result)
		}
	})
})

router.post('/cart', (req, res, next) => {
	const { error } = Validator.getInstance.validateProducts(Object.values(req.body))

	if (!error) {
		// @ts-ignore
		Redis.getInstance.hset('cart', req.user._id.toString(), JSON.stringify(req.body), (redisError) => {
			if (redisError) {
				next(new ServerError(redisError.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /cart', true))
			} else {
				res.json({ status: true })
			}
		})
	} else {
		next(new ServerError(JSON.stringify(error), HttpStatusCodes.BAD_REQUEST, 'POST /cart', true))
	}
})

router.get('/cart', (req, res, next) => {
	//  @ts-ignore
	Redis.getInstance.hget('cart', req.user._id.toString(), (error, reply) => {
		if (error) {
			next(new ServerError(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'GET /cart', true))
		} else {
			res.json(JSON.parse(reply))
		}
	})
})

router.post('/address', (req, res, next) => {
	// @ts-ignore
	User.findById(req.user._id).then((user: any) => {
		if (user) {
			user.addresses.push(req.body)
			user.save().then((result: any) => {
				res.json(result)
			})
		} else {
			next(new ServerError('User does not exists on Database, but in cache.', HttpStatusCodes.BAD_REQUEST, 'POST /address', true))
		}
	}).catch((reason) => {
		next(new ServerError(reason.message, HttpStatusCodes.BAD_REQUEST, 'POST /address', true))
	})
})

router.delete('/address', (req, res, next) => {
	// @ts-ignore
	User.findById(req.user._id).then((user: any) => {
		if (user) {
			user.addresses.splice(user.addresses.indexOf(user.addresses.find((address: any) => address._id.toString() === req.body._id)), 1)
			user.save().then((result: any) => {
				res.json(result)
			})
		} else {
			next(new ServerError('User does not exists on Database, but in cache.', HttpStatusCodes.BAD_REQUEST, 'DELETE /address', true))
		}
	}).catch((reason) => {
		next(new ServerError(reason.message, HttpStatusCodes.BAD_REQUEST, '/DELETE address', true))
	})
})

router.post('/order', (req, res, next) => {
	// @ts-ignore
	Redis.getInstance.hget('cart', req.user._id.toString(), (getErr, cart) => {
		if (!cart) {
			next(new ServerError('Empty cart!', HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /order', false))
			// @ts-ignore
		} else if (!req.user.addresses[req.body.address]) {
			next(new ServerError('Need an address!', HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /order', false))
		} else if (!getErr) {
			const id = Math.random().toString()

			// @ts-ignore
			const val = {
				id,
				// @ts-ignore
				customer: req.user.name_surname,
				// @ts-ignore
				address: req.user.addresses[req.body.address],
				date: new Date().toLocaleString(),
				// starts : 2.2 // Müşteri daha önce memnuniyetsizliğini belirttiyse bi güzellik yapılabilir. :)
				// price: (23.43 * 5) + (76.36 * 2), // Online ödemelerde manager'ın ücret ile işi yok.
				products: Object.values(cart)
			}

			const multi = Redis.getInstance.multi()

			multi.hset('category1', id, JSON.stringify(val))

			// @ts-ignore
			multi.hdel('cart', req.user._id.toString())

			multi.exec((error) => {
				if (error) {
					next(new ServerError(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /order', true))
				} else {
					res.json({ status: true })
				}
			})
		} else {
			next(new ServerError(getErr.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /order', true))
		}
	})
})

export default router