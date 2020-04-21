import { Router } from 'express'
import HttpStatusCodes from 'http-status-codes'
import Iyzipay from 'iyzipay'

import { Redis } from '../startup'
import { User } from '../models'
import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import ServerError from '../errors/ServerError'
import { validateProducts, comparePasswords } from './validator'
import ErrorMessages from '../errors/ErrorMessages'

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
			next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, JSON.stringify(error), true))
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
			next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, JSON.stringify(error), true))
		} else {
			res.json(result)
		}
	})
})

router.put('/profile', (req, res) => {
	// @ts-ignore
	User.findByIdAndUpdate(req.user._id, req.body).then((user) => {
		res.json(user)
	})
})

router.post('/cart', (req, res, next) => {
	const { error } = validateProducts(Object.values(req.body))

	if (!error) {
		// @ts-ignore
		Redis.getInstance.hset('cart', req.user._id.toString(), JSON.stringify(req.body), (redisError) => {
			if (redisError) {
				next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, redisError.message, true))
			} else {
				res.json({ status: true })
			}
		})
	} else {
		next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.BAD_REQUEST, JSON.stringify(error), true))
	}
})

router.get('/cart', (req, res, next) => {
	//  @ts-ignore
	// Redis.getInstance.hdel('cart', req.user._id.toString())
	Redis.getInstance.hget('cart', req.user._id.toString(), (error, reply) => {
		if (error) {
			next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, error.message, true))
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
			next(new ServerError(ErrorMessages.USER_IS_NOT_EXISTS, HttpStatusCodes.BAD_REQUEST, 'POST /user/address', true))
		}
	}).catch((reason) => {
		next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.BAD_REQUEST, reason.message, true))
	})
})

router.delete('/address/:id', (req, res, next) => {
	// @ts-ignore
	User.findById(req.user._id).then((user: any) => {
		if (user) {
			const deletedAddress = user.addresses.indexOf(user.addresses.find((address: any) => address._id.toString() === req.params.id))
			if (deletedAddress !== -1) {
				user.addresses.splice(deletedAddress, 1)
				user.save().then((result: any) => {
					res.json(result)
				})
			} else {
				next(new ServerError(ErrorMessages.NO_ADDRESS, HttpStatusCodes.BAD_REQUEST, 'DELETE /user/address', false))
			}
		} else {
			next(new ServerError(ErrorMessages.USER_IS_NOT_EXISTS, HttpStatusCodes.BAD_REQUEST, 'DELETE /user/address', true))
		}
	}).catch((reason) => {
		next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.BAD_REQUEST, reason.message, true))
	})
})

router.post('/order', (req, res, next) => {
	// @ts-ignore
	const selecetedAddress = req.user.addresses.find((address) => address._id.toString() === req.body.address)

	// @ts-ignore
	Redis.getInstance.hget('cart', req.user._id.toString(), (getErr, cart) => {
		if (!cart) {
			next(new ServerError(ErrorMessages.EMPTY_CART, HttpStatusCodes.BAD_REQUEST, 'POST /user/order', false))
			// @ts-ignore
		} else if (!selecetedAddress) {
			next(new ServerError(ErrorMessages.NO_ADDRESS, HttpStatusCodes.BAD_REQUEST, 'POST /user/order', false))
		} else if (!getErr) {
			const id = Math.random().toString()

			// @ts-ignore
			const val = {
				id,
				// @ts-ignore
				customer: req.user.name_surname,
				// @ts-ignore
				address: selecetedAddress.open_address,
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
					next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, error.message, true))
				} else {
					res.json({ status: true })
				}
			})
		} else {
			next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, getErr.message, true))
		}
	})
})

router.put('/change-password', (req, res, next) => {
	// @ts-ignore
	comparePasswords(req.body.old_password, req.user.password, ErrorMessages.WRONG_PASSWORD).then(() => {
		// @ts-ignore
		// eslint-disable-next-line no-param-reassign
		req.user.password = req.body.new_password
		// @ts-ignore
		req.user.save().then(() => {
			res.json({ status: true })
		})
	}).catch((reason: Error) => {
		next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, true))
	})
})

export default router