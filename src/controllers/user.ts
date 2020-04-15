import { Router } from 'express'
import Joi from '@hapi/joi'
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

router.get('/list-cards', (req, res) => {
	iyzipay.cardList.retrieve({
		locale: Iyzipay.LOCALE.TR,
		conversationId: '123456789',
		cardUserKey: 'ojBya0o8ecs7ynou3l94xmdB8f8='
	}, (error: any, result: any) => {
		if (error) {
			throw new ServerError('Redis', HttpStatusCodes.INTERNAL_SERVER_ERROR, JSON.stringify(error), false)
		} else {
			res.json(result)
		}
	})
})

router.post('/payment-card', (req, res) => {
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
			throw new ServerError('Redis', HttpStatusCodes.INTERNAL_SERVER_ERROR, JSON.stringify(error), false)
		} else {
			res.json(result)
		}
	})
})

router.post('/cart', (req, res) => {
	const schema = Joi.object({
		brand: Joi.string().required(),
		id: [
			Joi.string().required(),
			Joi.number().required(),
		],
		kind_name: Joi.string().allow(null, ''),
		product_name: Joi.string().required(),
		old_price: Joi.number().required(),
		price: Joi.number().required(),
		title: Joi.string().required(),
		category_breadcrumb: Joi.string().allow(null, ''),
		images: Joi.array().items(Joi.string()).required(),
		// images: Joi.array().items(Joi.string().required()).required(),
		image_types: Joi.object().required(),
		units: Joi.string().allow(null, ''),
		quantity: Joi.number().min(1).required()
	})

	const { error } = Validator.getInstance.validateProducts(Object.values(req.body))

	if (!error) {
		// @ts-ignore
		Redis.getInstance.hset('cart', req.user._id, JSON.stringify(req.body), (redisError) => {
			if (redisError) {
				throw new ServerError('Redis', HttpStatusCodes.INTERNAL_SERVER_ERROR, redisError.message, true)
			} else {
				res.json({ status: true })
			}
		})
	} else {
		throw new ServerError('', HttpStatusCodes.BAD_REQUEST, JSON.stringify(req.body), true)
	}
})

router.get('/cart', (req, res) => {
	//  @ts-ignore
	Redis.getInstance.hget('cart', req.user._id, (error, reply) => {
		if (error) {
			throw new ServerError('Redis', HttpStatusCodes.INTERNAL_SERVER_ERROR, error.message, true)
		} else {
			res.json(JSON.parse(reply))
		}
	})
})

router.put('/add-address', (req, res) => {
	// @ts-ignore
	User.findById(req.user._id).then((user: any) => {
		if (user) {
			user.addresses.push(req.body)
			user.save().then((result: any) => {
				res.json(result)
			})
		} else {
			throw new ServerError('Mongo', HttpStatusCodes.BAD_REQUEST, 'User does not exists on Database, but in cache.', false)
		}
	}).catch((reason) => {
		throw new ServerError('Mongo', HttpStatusCodes.BAD_REQUEST, reason.message, false)
	})
})

router.put('/delete-address', (req, res) => {
	// @ts-ignore
	User.findById(req.user._id).then((user: any) => {
		if (user) {
			user.addresses.splice(user.addresses.indexOf(user.addresses.find((address: any) => address._id.toString() === req.body._id)), 1)
			user.save().then((result: any) => {
				res.json(result)
			})
		} else {
			throw new ServerError('Mongo', HttpStatusCodes.BAD_REQUEST, 'User does not exists on Database, but in cache.', false)
		}
	}).catch((reason) => {
		throw new ServerError('Mongo', HttpStatusCodes.BAD_REQUEST, reason.message, false)
	})
})

router.post('/makeOrder', (req, res) => {
	// @ts-ignore
	Redis.getInstance.hget('cart', req.user._id, (getErr, cart) => {
		if (!getErr) {
			const id = Math.random().toString()

			const val = {
				id,
				customer: req.body.customer, // TODO ben zaten biliyorum customer'ın kim olduğunu
				address: req.body.address, // TODO hangi addressi olduğunu gönderecek ben user adreslerinden alıcam.
				date: new Date().toLocaleString(),
				// starts : 2.2 // Müşteri daha önce memnuniyetsizliğini belirttiyse bi güzellik yapılabilir. :)
				// price: (23.43 * 5) + (76.36 * 2), // Online ödemelerde manager'ın ücret ile işi yok.
				products: Object.values(cart)
			}

			const multi = Redis.getInstance.multi()

			multi.hset('category1', id, JSON.stringify(val))

			// @ts-ignore
			multi.hdel('cart', req.user._id)

			multi.exec((error) => {
				if (error) {
					throw new ServerError('Redis', HttpStatusCodes.INTERNAL_SERVER_ERROR, error.message, true)
				} else {
					res.json({ status: true })
				}
			})
		} else {
			throw new ServerError('Redis', HttpStatusCodes.INTERNAL_SERVER_ERROR, getErr.message, true)
		}
	})
})

export default router