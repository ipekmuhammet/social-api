import { Router } from 'express'
import jwt from 'jsonwebtoken'
import Nexmo from 'nexmo'
import HttpStatusCodes from 'http-status-codes'

import { Redis, Elasticsearch } from '../startup'
import Authority from '../enums/authority-enum'

// eslint-disable-next-line no-unused-vars
import { validateAuthority, validatePhone } from '../middlewares/auth-middleware'
import ServerError from '../errors/ServerError'
import { registerUser, registerManager } from '../services/unauthorized'
import {
	isUserNonExists, isUserExists, getActivationCode, compareActivationCode, comparePasswords, isManagerNonExists
} from './validator'
import ErrorMessages from '../errors/ErrorMessages'

const router = Router()

router.use(validateAuthority(Authority.ANONIM))
router.use(validatePhone())

// eslint-disable-next-line no-unused-vars
const sendSms = (to: string, message: string) => {
	const smsManager: any = new Nexmo({
		apiKey: '14efe668',
		apiSecret: 'ivcyJQr7tWmvT4yP',
	})

	const from = 'Platform App'

	smsManager.message.sendSms(from, to, message)
}

router.get('/categories', (req, res) => {
	Redis.getInstance.getAsync('categories').then((val: any) => {
		res.json(JSON.parse(val))
	})
})

router.get('/products', (req, res, next) => {
	if (req.query.categoryId) {
		Redis.getInstance.hget('productsx', req.body.categoryId, (error: Error, obj: any) => {
			if (error) {
				next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, error.message, true))
			} else {
				res.json(JSON.parse(obj))
			}
		})
	} else {
		Redis.getInstance.hgetall('productsx', (error: Error, obj: any) => {
			if (error) {
				next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, error.message, true))
			} else {
				res.json(Object.values(obj).reduce((previousValue, currentValue: any) => Object.assign(previousValue, JSON.parse(currentValue)), {}))
			}
		})
	}
})

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImF1dGhvcml0eSI6MCwiX2lkIjoiNWU4NDBhNTFjYzFjYzMzMjBjY2M5NmNhIiwicGhvbmVfbnVtYmVyIjoiOTA1NDY4MTMzMTk4IiwicGFzc3dvcmQiOiIkMmIkMTAkVlEvek1KWm5zaUouSnJkNnFwek9KT2dDYk9ISm5qRXF4UGpIUHIxb3E0SzRFQk4wMzVrZVciLCJuYW1lX3N1cm5hbWUiOiJNdWhhbW1ldCDEsHBlayIsImVtYWlsIjoibXVoYW1tZXRpcGVrNTdAaG90bWFpbC5jb20iLCJhZGRyZXNzZXMiOlt7InR5cGUiOjAsIl9pZCI6IjVlOTA3ODU1YzU2MTJmMWMyY2JmZGZiZSIsIm9wZW5fYWRkcmVzcyI6IkF5dmFuc2FyYXksIEFobWV0IFJ1ZmFpIFNrLiBObzo2LCAzNDA4NyBGYXRpaC_EsHN0YW5idWwsIFR1cmtleSJ9LHsidHlwZSI6MCwiX2lkIjoiNWU5NDVhNWNjZDBhOTUyY2ZjMWIxMGY1Iiwib3Blbl9hZGRyZXNzIjoiQXl2YW5zYXJheSwgQWhtZXQgUnVmYWkgU2suIE5vOjYsIDM0MDg3IEZhdGloL8Swc3RhbmJ1bCwgVHVya2V5In1dLCJfX3YiOjQ0fSwiaWF0IjoxNTg2ODE1ODYyfQ.tiNKwye4-sGhmOJ9iaXqYr4tNJmjE187bZShBnvFLnA

router.get('/product/:id', (req, res, next) => {
	const multi = Redis.getInstance.multi()

	multi.getAsync(req.params.id)

	// @ts-ignore
	if (req.user?._id) {
		// @ts-ignore
		multi.hget('cart', req.user._id.toString())
	}

	multi.exec((error, results) => { // 37695 38532 37295
		if (error) {
			next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, error.message, true))
		} else if (results[0]) {
			// @ts-ignore
			if (req.user?._id.toString()) {
				if (results[1]) {
					if (Object.keys(JSON.parse(results[1])).includes(req.params.id)) {
						Redis.getInstance.hset(
							'cart',
							// @ts-ignore
							req.user._id.toString(),
							JSON.stringify(Object.assign(
								JSON.parse(results[1]),
								{ [req.params.id]: Object.assign(JSON.parse(results[0]), { quantity: (JSON.parse(results[1])[req.params.id].quantity ?? 1) + 1 }) }
							))
						)
					} else {
						Redis.getInstance.hset(
							'cart',
							// @ts-ignore
							req.user._id.toString(),
							JSON.stringify(Object.assign(
								JSON.parse(results[1]),
								{ [req.params.id]: results[0] }
							))
						)
					}
				} else {
					Redis.getInstance.hset(
						'cart',
						// @ts-ignore
						req.user._id.toString(),
						JSON.stringify({ [req.params.id]: Object.assign(JSON.parse(results[0]), { quantity: 1 }) })
					)
				}
			}
			res.json(JSON.parse(results[0]))
		} else {
			next(new ServerError(ErrorMessages.NON_EXISTS_PRODUCT, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, false))
		}
	})

	//	multi.getAsync(req.params.id).then((obj: any) => {
	//		res.json(JSON.parse(obj))
	//	})
})

router.get('/search-product', (req, res) => {
	Elasticsearch.getClient.search({
		index: 'doc',
		type: 'doc',
		body: {
			query: {
				bool: {
					must: [
						// {
						// 	geo_distance: {
						// 		distance: '1km',
						// 		'geometry.location': location
						// 	}
						// },
						{
							match_phrase_prefix: {
								product_name: req.query.name
							}
						}
					]
				}
			}
		}
	}).then((vals: any) => {
		res.json(vals.body.hits.hits)
	})
})

router.post('/send-activation-code', (req, res, next) => {
	const activationCode = parseInt(Math.floor(1000 + Math.random() * 9000).toString(), 10).toString()
	console.log(activationCode)

	Redis.getInstance.hset('activationCode', req.body.phone_number, activationCode, (redisError) => {
		if (redisError) {
			next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, redisError.message, true))
		} else {
			res.status(HttpStatusCodes.ACCEPTED).json({ status: true })
		}
	})
})

router.post('/register', (req, res, next) => {
	// isUserNonExists(req.body.user.phone_number)
	isUserNonExists(req.body.phone_number)
		.then(() => getActivationCode(req.body.phone_number))
		.then((activationCode: string) => compareActivationCode(req.body.activationCode, activationCode))
		.then(() => registerUser(req.body, req.body.phone_number))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(new ServerError(reason.message, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /register', reason.isOperational ?? false))
		})
})

router.post('/register-manager', (req, res) => {
	isManagerNonExists(req.body.phoneNumber)
		.then(() => registerManager(req.body, req.body.phone_number))
		.then((response) => {
			res.json(response)
		})
})

router.post('/login', (req, res, next) => {
	isUserExists(req.body.phone_number)
		.then((user) => (
			// @ts-ignore
			comparePasswords(req.body.password, user.password, 'Wrong Phone number or Password!').then(() => {
				jwt.sign({ payload: user }, 'secret', (jwtErr: Error, token: any) => {
					if (jwtErr) {
						next(new ServerError(jwtErr.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, ErrorMessages.UNEXPECTED_ERROR, true))
					} else {
						res.json({ token, user })
					}
				})
			})
		)).catch((reason) => {
			next(new ServerError(reason.message, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /login', reason.isOperational ?? true))
		})
})

router.put('/reset-password', (req, res, next) => {
	getActivationCode(req.body.phone_number)
		.then((activationCode: string) => compareActivationCode(req.body.activationCode, activationCode))
		.then(() => isUserExists(req.body.phone_number))
		.then((user) => {
			// @ts-ignore
			// eslint-disable-next-line no-param-reassign
			user.password = req.body.new_password
			user.save().then(() => {
				res.json({ status: true })
			})
		})
		.catch((reason) => {
			next(new ServerError(reason.message, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /reset-password', reason.isOperational ?? true))
		})
})

export default router