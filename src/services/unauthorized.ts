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

// eslint-disable-next-line no-unused-vars
import { UserDocument } from '../models/User'
// eslint-disable-next-line no-unused-vars
import { ManagerDocument } from '../models/Manager'
// eslint-disable-next-line no-unused-vars
import { ProductDocument } from '../models/Product'

export const sendSms = (to: string, message: string) => {
	const smsManager: any = new Nexmo({
		apiKey: '14efe668',
		apiSecret: 'ivcyJQr7tWmvT4yP',
	})

	const from = 'Platform App'

	smsManager.message.sendSms(from, to, message)
}

export const getCategories = () => (
	Redis.getInstance.getAsync('categories').then((categories) => JSON.parse(categories))
)

export const getAllProducts = () => (
	new Promise((resolve, reject) => {
		Redis.getInstance.hgetallAsync('products').then((products) => {
			resolve(Object.values(products).reduce((previousValue, currentValue) => Object.assign(previousValue, JSON.parse(currentValue)), {}))
		}).catch((reason) => {
			reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
		})
	})
)

export const getProduct = (productId: string, user: UserDocument) => ( // "5ea7ac324756fd198887099a", "5ea7ac324756fd1988870999", "5ea7ac324756fd198887099b"
	new Promise((resolve, reject) => {
		const multi = Redis.getInstance.multi()

		multi.getAsync(productId)

		// @ts-ignore
		if (user?._id) {
			// @ts-ignore
			multi.hget('cart', user._id.toString())
		}

		multi.execAsync().then((results) => {
			if (results[0]) {
				resolve({ product: results[0], cart: results[1] })
			} else {
				reject(new ServerError(ErrorMessages.NON_EXISTS_PRODUCT, HttpStatusCodes.BAD_REQUEST, null, false))
			}
		}).catch((reason) => {
			reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
		})
	})
)

export const addProductToCart = (product: ProductDocument, cart: any, user: UserDocument) => (
	new Promise((resolve) => {
		// @ts-ignore
		if (user?._id.toString()) {
			if (cart) {
				if (Object.keys(cart).includes(product._id.toString())) {
					Redis.getInstance.hset(
						'cart',
						// @ts-ignore
						user._id.toString(),
						JSON.stringify({
							...cart,
							[product._id.toString()]: {
								...product,
								quantity: (cart[product._id.toString()].quantity ?? 1) + 1
							}
						})
					)

					resolve({
						...product,
						quantity: (cart[product._id.toString()].quantity ?? 1) + 1
					})
				} else {
					Redis.getInstance.hset(
						'cart',
						// @ts-ignore
						user._id.toString(),
						JSON.stringify({
							...cart,
							[product._id.toString()]: {
								...product,
								quantity: 1
							}
						})
					)

					resolve({
						...product,
						quantity: 1
					})
				}
			} else {
				Redis.getInstance.hset(
					'cart',
					// @ts-ignore
					user._id.toString(),
					JSON.stringify({
						[product._id.toString()]: {
							...product,
							quantity: 1
						}
					})
				)

				resolve({
					...product,
					quantity: 1
				})
			}
		} else {
			resolve(product)
		}
	})
)

export const takeOffProductFromCart = (product: ProductDocument, cart: any, user: UserDocument) => (
	new Promise((resolve, reject) => {
		if (user?._id.toString()) {
			if (cart) {
				if (Object.keys(cart).includes(product._id.toString())) {
					if (cart[product._id.toString()].quantity > 1) {
						Redis.getInstance.hset(
							'cart',
							// @ts-ignore
							user._id.toString(),
							JSON.stringify(Object.assign(
								cart,
								{
									[product._id.toString()]: Object.assign(
										product,
										{
											quantity: (cart[product._id.toString()].quantity) - 1
										}
									)
								}
							))
						)
					} else if (cart[product._id.toString()].quantity === 1) {
						// eslint-disable-next-line no-param-reassign
						delete cart[product._id.toString()]
						Redis.getInstance.hset(
							'cart',
							// @ts-ignore
							user._id.toString(),
							JSON.stringify(cart)
						)
					} else {
						reject(new ServerError(ErrorMessages.NON_EXISTS_PRODUCT, HttpStatusCodes.BAD_REQUEST, ErrorMessages.NON_EXISTS_PRODUCT, false))
					}
				} else {
					reject(new ServerError(ErrorMessages.NON_EXISTS_PRODUCT, HttpStatusCodes.BAD_REQUEST, ErrorMessages.NON_EXISTS_PRODUCT, false))
				}
			} else {
				reject(new ServerError(ErrorMessages.NON_EXISTS_PRODUCT, HttpStatusCodes.BAD_REQUEST, ErrorMessages.NON_EXISTS_PRODUCT, false))
			}
		}
		resolve(product)
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
								name
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

export const login = (user: UserDocument | ManagerDocument, password: string) => (
	new Promise((resolve, reject) => {
		// @ts-ignore
		comparePasswords(user.password, password, ErrorMessages.WRONG_PHONE_OR_PASSWORD).then(() => {
			resolve(user)
		}).catch((error) => {
			reject(new ServerError(error.message, HttpStatusCodes.UNAUTHORIZED, null, true))
		})
	})
)

export const isManagerVerified = (manager: any) => (
	new Promise((resolve, reject) => {
		if (!manager.verified) {
			reject(new ServerError(ErrorMessages.MANAGER_IS_NOT_VERIFIED, HttpStatusCodes.UNAUTHORIZED, ErrorMessages.MANAGER_IS_NOT_VERIFIED, true))
		} else {
			resolve()
		}
	})
)

export const registerUser = (userContext: any) => (
	new User(userContext).save().then((user) => {
		// sendSms(phoneNumber, `${activationCode} is your activation code to activate your account.`)
		Redis.getInstance.del(`${user.phoneNumber}:activationCode:${ActivationCodes.REGISTER_USER}`)
		return user
	})
)

export const registerManager = (managerContext: any) => (
	new Manager(managerContext).save().then((manager) => {
		// sendSms(phoneNumber, `${activationCode} is your activation code to activate your account.`)
		Redis.getInstance.del(`${managerContext.phoneNumber}:activationCode:${ActivationCodes.REGISTER_MANAGER}`)
		return manager
	})
)

export const createToken = (context: any) => (
	new Promise((resolve, reject) => {
		jwt.sign({ payload: context }, process.env.SECRET, (jwtErr: Error, token: string) => {
			if (jwtErr) {
				reject(new ServerError(jwtErr.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, true))
			} else {
				resolve(token)
			}
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