import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'
import Nexmo from 'nexmo'

import { Redis, Elasticsearch } from '../startup'
import ServerError from '../errors/ServerError'
import { User, Manager } from '../models'
import ErrorMessages from '../errors/ErrorMessages'
import { comparePasswords } from '../controllers/validator'


export const sendSms = (to: string, message: string) => {
	const smsManager: any = new Nexmo({
		apiKey: '14efe668',
		apiSecret: 'ivcyJQr7tWmvT4yP',
	})

	const from = 'Platform App'

	smsManager.message.sendSms(from, to, message)
}

export const getCategories = () => (
	Redis.getInstance.getAsync('categories').then((val: any) => JSON.parse(val))
)

export const getAllProducts = () => (
	new Promise((resolve, reject) => {
		Redis.getInstance.hgetall('products', (error: Error, obj: any) => {
			if (error) {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, error.message, true))
			} else {
				resolve(Object.values(obj).reduce((previousValue, currentValue: any) => Object.assign(previousValue, JSON.parse(currentValue)), {}))
			}
		})
	})
)

export const getProduct = (productId: string, user: any) => (
	new Promise((resolve, reject) => {
		const multi = Redis.getInstance.multi()

		multi.getAsync(productId)

		// @ts-ignore
		if (user?._id) {
			// @ts-ignore
			multi.hget('cart', user._id.toString())
		}

		multi.exec((error, results) => { // 37695 38532 37295
			if (error) {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, error.message, true))
			} else if (results[0]) {
				resolve({ product: results[0], cart: results[1] })
			} else {
				reject(new ServerError(ErrorMessages.NON_EXISTS_PRODUCT, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, false))
			}
		})

		//	multi.getAsync(productId).then((obj: any) => {
		//		res.json(JSON.parse(obj))
		//	})
	})
)

export const addProductToCart = (productId: string, product: any, cart: any) => (
	new Promise((resolve) => {
		// @ts-ignore
		if (user?._id.toString()) {
			if (cart) {
				if (Object.keys(JSON.parse(cart)).includes(productId)) {
					Redis.getInstance.hset(
						'cart',
						// @ts-ignore
						user._id.toString(),
						JSON.stringify(Object.assign(
							JSON.parse(cart),
							{
								[productId]: Object.assign(JSON.parse(product), {
									quantity: (JSON.parse(cart)[productId].quantity ?? 1) + 1
								})
							}
						))
					)
				} else {
					Redis.getInstance.hset(
						'cart',
						// @ts-ignore
						user._id.toString(),
						JSON.stringify(Object.assign(
							JSON.parse(cart),
							{ [productId]: product }
						))
					)
				}
			} else {
				Redis.getInstance.hset(
					'cart',
					// @ts-ignore
					user._id.toString(),
					JSON.stringify({ [productId]: Object.assign(JSON.parse(product), { quantity: 1 }) })
				)
			}
		}
		resolve(JSON.parse(product))
	})
)

export const search = (name: string) => (
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
								product_name: name
							}
						}
					]
				}
			}
		}
	})
)

export const createActivationCode = (phoneNumber: string) => (
	new Promise((resolve, reject) => {
		const activationCode = parseInt(Math.floor(1000 + Math.random() * 9000).toString(), 10).toString()
		console.log(activationCode)

		Redis.getInstance.hset('activationCode', phoneNumber, activationCode, (redisError) => {
			if (redisError) {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, redisError.message, true))
			} else {
				resolve()
			}
		})
	})
)

export const login = (user: any, password: string) => (
	new Promise((resolve, reject) => {
		// @ts-ignore
		comparePasswords(user.password, password, 'Wrong Phone number or Password!').then(() => {
			jwt.sign({ payload: user }, 'secret', (jwtErr: Error, token: any) => {
				if (jwtErr) {
					reject(new ServerError(jwtErr.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, ErrorMessages.UNEXPECTED_ERROR, true))
				} else {
					resolve({ token, user })
				}
			})
		}).catch((error) => {
			reject(new ServerError(null, HttpStatusCodes.UNAUTHORIZED, error.message, true))
		})
	})
)

export const registerUser = (userContext: any, phoneNumber: string) => (
	new Promise((resolve, reject) => {
		new User(userContext).save().then((user) => {
			// sendSms('905468133198', `${activationCode} is your activation code to activate your account.`)
			jwt.sign({ payload: user }, 'secret', (jwtErr: Error, token: any) => {
				if (jwtErr) {
					reject(new ServerError(jwtErr.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /register', true))
				} else {
					Redis.getInstance.hdel('activationCode', phoneNumber)
					resolve({ token, user })
				}
			})
		}).catch((reason) => {
			reject(new ServerError(reason.message, HttpStatusCodes.BAD_REQUEST, 'POST /register', true))
		})
	})
)

export const registerManager = (managerContext: any, phoneNumber: string) => (
	new Promise((resolve, reject) => {
		new Manager(managerContext).save().then((manager) => {
			// sendSms('905468133198', `${activationCode} is your activation code to activate your account.`)
			jwt.sign({ payload: manager }, 'secret', (jwtErr: Error, token: any) => {
				if (jwtErr) {
					reject(new ServerError(jwtErr.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /register-manager', true))
				} else {
					Redis.getInstance.hdel('activationCode', phoneNumber)
					resolve({ token, manager })
				}
			})
		}).catch((reason) => {
			reject(new ServerError(reason.message, HttpStatusCodes.BAD_REQUEST, 'POST /register-manager', true))
		})
	})
)