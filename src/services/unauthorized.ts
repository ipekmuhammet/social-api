import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'
import Nexmo from 'nexmo'

import { Redis, Elasticsearch } from '../startup'
import ServerError from '../errors/ServerError'
import { User, Manager } from '../models'
import ErrorMessages from '../errors/ErrorMessages'
import ActivationCodes from '../enums/activation-code-enum'

import {
	comparePasswords,
	isUserNonExists,
	isUserExists,
	isManagerNonExists,
	isManagerExists
} from '../validators'


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
		Redis.getInstance.hgetallAsync('products').then((products) => {
			resolve(Object.values(products).reduce((previousValue, currentValue: any) => Object.assign(previousValue, JSON.parse(currentValue)), {}))
		}).catch((reason) => {
			reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
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

		multi.execAsync().then((results) => { // 37695 38532 37295
			if (results[0]) {
				resolve({ product: results[0], cart: results[1] })
			} else {
				reject(new ServerError(ErrorMessages.NON_EXISTS_PRODUCT, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, false))
			}
		}).catch((reason) => {
			reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
		})

		//	multi.getAsync(productId).then((obj: any) => {
		//		res.json(JSON.parse(obj))
		//	})
	})
)

export const addProductToCart = (productId: string, product: any, cart: any, user: any) => (
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

export const checkConvenientOfActivationCodeRequest = (phoneNumber: string, activationCodeType: ActivationCodes) => (
	new Promise((resolve, reject) => {
		if (activationCodeType === ActivationCodes.REGISTER_USER) {
			resolve(isUserNonExists(phoneNumber))
		}
		if (activationCodeType === ActivationCodes.RESET_PASSWORD) {
			resolve(isUserExists(phoneNumber))
		}
		if (activationCodeType === ActivationCodes.REGISTER_MANAGER) {
			resolve(isManagerNonExists(phoneNumber))
		}
		if (activationCodeType === ActivationCodes.RESET_MANAGER_PASSWORD) {
			resolve(isManagerExists(phoneNumber))
		}
		reject(new Error('Unknown type of activation code'))
	})
)

export const createActivationCode = (phoneNumber: string, activationCodeType: ActivationCodes) => (
	new Promise((resolve, reject) => {
		const activationCode = parseInt(Math.floor(1000 + Math.random() * 9000).toString(), 10).toString()
		console.log(activationCode)

		// @ts-ignore
		Redis.getInstance.setAsync(`${phoneNumber}:activationCode:${activationCodeType}`, activationCode).then(() => {
			Redis.getInstance.expire(`${phoneNumber}:activationCode:${activationCodeType}`, 60 * 3)
			resolve()
		}).catch((reason) => {
			reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
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
			reject(new ServerError(error.message, HttpStatusCodes.UNAUTHORIZED, null, true))
		})
	})
)

export const isManagerVerified = (manager: any, retrnVal: any) => (
	new Promise((resolve, reject) => {
		if (!manager.verified) {
			reject(new ServerError('Manager is not verified', HttpStatusCodes.UNAUTHORIZED, 'Manager is not verified', true))
		} else {
			resolve(retrnVal)
		}
	})
)

export const registerUser = (userContext: any, phoneNumber: string) => (
	new Promise((resolve, reject) => {
		new User(userContext).save().then((user) => {
			// sendSms(phoneNumber, `${activationCode} is your activation code to activate your account.`)
			jwt.sign({ payload: user }, 'secret', (jwtErr: Error, token: any) => {
				if (jwtErr) {
					reject(new ServerError(jwtErr.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, jwtErr.message, true))
				} else {
					Redis.getInstance.del(`${phoneNumber}:activationCode:${ActivationCodes.REGISTER_USER}`)
					resolve({ token, user })
				}
			})
		}).catch((reason) => {
			reject(new ServerError(reason.message, HttpStatusCodes.BAD_REQUEST, reason.message, true))
		})
	})
)

export const registerManager = (managerContext: any, phoneNumber: string) => (
	new Promise((resolve, reject) => {
		new Manager(managerContext).save().then((manager) => {
			// sendSms(phoneNumber, `${activationCode} is your activation code to activate your account.`)
			jwt.sign({ payload: manager }, 'secret', (jwtErr: Error, token: any) => {
				if (jwtErr) {
					reject(new ServerError(jwtErr.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /register-manager', true))
				} else {
					Redis.getInstance.del(`${phoneNumber}:activationCode:${ActivationCodes.REGISTER_MANAGER}`)
					resolve({ token, manager })
				}
			})
		}).catch((reason) => {
			reject(new ServerError(reason.message, HttpStatusCodes.BAD_REQUEST, 'POST /register-manager', true))
		})
	})
)

export const handleError = (error: any, path: string) => {
	if (error.httpCode) {
		return error
	}
	if (error._original) { // JOI ERROR
		return new ServerError(error.message, HttpStatusCodes.BAD_REQUEST, path, true)
	}
	return new ServerError(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, path, true)
}