import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Nexmo from 'nexmo'
import HttpStatusCodes from 'http-status-codes'

import { Redis, Elasticsearch } from '../startup'
import { User } from '../models'
import Authority from '../enums/authority-enum'

// eslint-disable-next-line no-unused-vars
import { validateAuthority, validatePhone } from '../middlewares/auth-middleware'


import ServerError from '../errors/ServerError'

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

router.get('/products', (req, res) => {
	if (req.query.categoryId) {
		Redis.getInstance.hget('productsx', req.body.categoryId, (err: any, obj: any) => {
			if (err) {
				console.log(err)
				throw new Error('err /products') // TODO
			} else {
				res.json(JSON.parse(obj))
			}
		})
	} else {
		Redis.getInstance.hgetall('productsx', (err: any, obj: any) => {
			if (err) {
				console.log(err)
				throw new Error('err /products') // TODO
			} else {
				res.json(Object.values(obj).reduce((previousValue, currentValue: any) => Object.assign(previousValue, JSON.parse(currentValue)), {}))
			}
		})
	}
})

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImF1dGhvcml0eSI6MCwiX2lkIjoiNWU4NDBhNTFjYzFjYzMzMjBjY2M5NmNhIiwicGhvbmVfbnVtYmVyIjoiOTA1NDY4MTMzMTk4IiwicGFzc3dvcmQiOiIkMmIkMTAkVlEvek1KWm5zaUouSnJkNnFwek9KT2dDYk9ISm5qRXF4UGpIUHIxb3E0SzRFQk4wMzVrZVciLCJuYW1lX3N1cm5hbWUiOiJNdWhhbW1ldCDEsHBlayIsImVtYWlsIjoibXVoYW1tZXRpcGVrNTdAaG90bWFpbC5jb20iLCJhZGRyZXNzZXMiOlt7InR5cGUiOjAsIl9pZCI6IjVlOTA3ODU1YzU2MTJmMWMyY2JmZGZiZSIsIm9wZW5fYWRkcmVzcyI6IkF5dmFuc2FyYXksIEFobWV0IFJ1ZmFpIFNrLiBObzo2LCAzNDA4NyBGYXRpaC_EsHN0YW5idWwsIFR1cmtleSJ9LHsidHlwZSI6MCwiX2lkIjoiNWU5NDVhNWNjZDBhOTUyY2ZjMWIxMGY1Iiwib3Blbl9hZGRyZXNzIjoiQXl2YW5zYXJheSwgQWhtZXQgUnVmYWkgU2suIE5vOjYsIDM0MDg3IEZhdGloL8Swc3RhbmJ1bCwgVHVya2V5In1dLCJfX3YiOjQ0fSwiaWF0IjoxNTg2ODE1ODYyfQ.tiNKwye4-sGhmOJ9iaXqYr4tNJmjE187bZShBnvFLnA

router.get('/product/:id', (req, res) => {
	const multi = Redis.getInstance.multi()

	multi.getAsync(req.params.id)

	// @ts-ignore
	if (req.userId) {
		// @ts-ignore
		multi.hget('cart', req.userId)
	}

	multi.exec((error, results) => { // 37695 38532 37295
		if (error) {
			throw new ServerError('Redis', HttpStatusCodes.INTERNAL_SERVER_ERROR, error.message, true)
		} else if (results[0]) {
			// @ts-ignore
			if (req.userId) {
				if (results[1]) {
					if (Object.keys(JSON.parse(results[1])).includes(req.params.id)) {
						Redis.getInstance.hset(
							'cart',
							// @ts-ignore
							req.userId,
							JSON.stringify(Object.assign(
								JSON.parse(results[1]),
								{ [req.params.id]: Object.assign(JSON.parse(results[0]), { quantity: (JSON.parse(results[1])[req.params.id].quantity ?? 1) + 1 }) }
							))
						)
					} else {
						Redis.getInstance.hset(
							'cart',
							// @ts-ignore
							req.userId,
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
						req.userId,
						JSON.stringify({ [req.params.id]: Object.assign(JSON.parse(results[0]), { quantity: 1 }) })
					)
				}
			}
			res.json(JSON.parse(results[0]))
		} else {
			throw new ServerError('Redis', HttpStatusCodes.INTERNAL_SERVER_ERROR, 'Unknown Error.', true)
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
								name: 'po'
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

router.post('/send-activation-code', (req, res) => {
	const activationCode = parseInt(Math.floor(1000 + Math.random() * 9000).toString(), 10).toString()
	console.log('activationCode', activationCode)

	Redis.getInstance.hset('activationCode', req.body.phone_number, activationCode, (redisError) => {
		if (redisError) {
			console.log(redisError)
			throw new ServerError('Redis', HttpStatusCodes.INTERNAL_SERVER_ERROR, redisError.message, true)
		} else {
			res.status(HttpStatusCodes.ACCEPTED).json({ status: true })
		}
	})
})

router.post('/register', (req, res) => {
	Redis.getInstance.hget('activationCode', req.body.phone_number, (redisError, reply) => {
		console.log(req.body.activation_code, reply)
		if (redisError) {
			console.log(redisError)
			res.json({ status: false, error: redisError })
		} else if (req.body.activation_code === reply) {
			new User(req.body).save().then((user) => {
				// sendSms('905468133198', `${activationCode} is your activation code to activate your account.`)
				console.log(user)
				jwt.sign({ payload: user }, 'secret', (jwtErr: any, token: any) => {
					if (jwtErr) {
						console.log(jwtErr)
						res.json({ status: false })
					} else {
						Redis.getInstance.hdel('activationCode', req.body.phone_number)
						res.json({ token, user })
					}
				})
			}).catch((reason) => {
				console.log(reason)
				res.status(HttpStatusCodes.BAD_REQUEST).json({ status: false })
			})
		} else {
			res.status(HttpStatusCodes.BAD_REQUEST).json('Wrong activation code.')
		}
	})
})

router.post('/login', (req, res) => {
	User.findOne({ phone_number: req.body.phone_number }).then((user) => {
		if (user) {
			// @ts-ignore
			bcrypt.compare(req.body.password, user.password).then((validPassword) => {
				if (!validPassword) {
					res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
				} else {
					jwt.sign({ payload: user }, 'secret', (jwtErr: any, token: any) => {
						if (jwtErr) {
							console.log(jwtErr)
							res.json({ status: false })
						} else {
							res.json({ token, user })
						}
					})
				}
			})
		} else {
			res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
		}
	}).catch((reason) => {
		console.log(reason)
		res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
	})
})

router.put('/change-password', (req, res) => {
	User.findOne({ phone_number: req.body.phone_number }).then((user) => {
		if (user) {
			// @ts-ignore
			bcrypt.compare(req.body.old_password, user.password).then((validPassword) => {
				if (!validPassword) {
					res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
				} else {
					// @ts-ignore
					// eslint-disable-next-line no-param-reassign
					user.password = req.body.new_password
					user.save().then(() => {
						res.json({ status: true })
					})
				}
			})
		} else {
			res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
		}
	}).catch((reason) => {
		console.log(reason)
		res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
	})
})

export default router