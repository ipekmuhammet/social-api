import HttpStatusCodes from 'http-status-codes'
import Iyzipay from 'iyzipay'

import ErrorMessages from '../errors/ErrorMessages'
import ServerError from '../errors/ServerError'
import { User } from '../models'
import { Redis } from '../startup'
import { validateProducts } from '../validators/user-validator'

const iyzipay = new Iyzipay({
	apiKey: 'sandbox-hbjzTU7CZDxarIUKVMhWLvHOIMIb3Z40',
	secretKey: 'sandbox-F01xQT4VMHAdFDB4RFNgo2l0kMImhCPX',
	uri: 'https://sandbox-api.iyzipay.com'
})

export const listCards = (cardUserKey: string) => (
	new Promise((resolve, reject) => {
		iyzipay.cardList.retrieve({
			locale: Iyzipay.LOCALE.TR,
			conversationId: '123456789',
			cardUserKey
		}, (error: any, cards: any) => {
			if (error) {
				reject(new Error(JSON.stringify(error)))
			} else {
				resolve(cards)
			}
		})
	})
)

export const addCardToUser = (cardUserKey: string, card: any) => (
	new Promise((resolve, reject) => {
		iyzipay.card.create({
			locale: Iyzipay.LOCALE.TR,
			// conversationId: '123456789',
			cardUserKey, // TODO get from user object from database/redis
			card// Validate card datas	//	{
			//		cardAlias: 'card alias',
			//		cardHolderName: 'John Doe',
			//		cardNumber: '5890040000000016',
			//		expireMonth: '12',
			//		expireYear: '2030'
			//	}
		}, (error: any, result: any) => {
			if (error) {
				reject(new Error(JSON.stringify(error)))
			} else {
				resolve(result)
			}
		})
	})
)

export const updateUser = (userId: string, userContext: any) => (
	User.findByIdAndUpdate(userId, userContext)
)

export const saveCart = (userId: string, cart: any) => (
	new Promise((resolve, reject) => {
		// @ts-ignore
		Redis.getInstance.hsetAsync('cart', userId, JSON.stringify(cart)).then(() => {
			resolve({ status: true })
		}).catch((reason) => {
			reject(new Error(reason.message))
		})
	})
)

export const getCart = (userId: string) => (
	new Promise((resolve, reject) => {
		// Redis.getInstance.hdel('cart', req.user._id.toString())
		Redis.getInstance.hgetAsync('cart', userId).then((cart) => {
			resolve(JSON.parse(cart))
		}).catch((reason) => {
			reject(new Error(reason.message))
		})
	})
)

export const deleteAddress = (userId: string, deletedAddressId: string) => (
	// @ts-ignore
	User.findById(userId).then((user: any) => {
		if (!user) {
			throw new ServerError(ErrorMessages.USER_IS_NOT_EXISTS, HttpStatusCodes.BAD_REQUEST, 'DELETE /user/address', true)
		} else {
			const deletedAddress = user.addresses.indexOf(user.addresses.find((address: any) => address._id.toString() === deletedAddressId))
			if (deletedAddress === -1) {
				throw new ServerError(ErrorMessages.NO_ADDRESS, HttpStatusCodes.BAD_REQUEST, 'DELETE /user/address', false)
			} else {
				user.addresses.splice(deletedAddress, 1)
				return user.save()
			}
		}
	}).catch((reason) => {
		throw new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.BAD_REQUEST, reason.message, true)
	})
)

export const makeOrder = (user: any, context: any) => (
	new Promise((resolve, reject) => {
		// @ts-ignore
		const selecetedAddress = user.addresses.find((address) => address._id.toString() === context.address)

		// @ts-ignore
		Redis.getInstance.hgetAsync('cart', user._id.toString()).then((cart) => {
			if (!cart) {
				reject(new ServerError(ErrorMessages.EMPTY_CART, HttpStatusCodes.BAD_REQUEST, 'POST /user/order', false))
				// @ts-ignore
			} else if (!selecetedAddress) {
				reject(new ServerError(ErrorMessages.NO_ADDRESS, HttpStatusCodes.BAD_REQUEST, 'POST /user/order', false))
			} else {
				const id = Math.random().toString()

				// @ts-ignore
				const val = {
					id,
					// @ts-ignore
					customer: user.name_surname,
					// @ts-ignore
					address: selecetedAddress.open_address,
					date: new Date().toLocaleString(),
					// starts : 2.2 // Müşteri daha önce memnuniyetsizliğini belirttiyse bi güzellik yapılabilir. :)
					// price: (23.43 * 5) + (76.36 * 2), // Online ödemelerde manager'ın ücret ile işi yok.
					products: Object.values(JSON.parse(cart))
				}

				const multi = Redis.getInstance.multi()

				multi.hset('orders', id, JSON.stringify(val))

				// @ts-ignore
				multi.hdel('cart', user._id.toString())

				multi.exec((error) => {
					if (error) {
						reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, error.message, true))
					} else {
						resolve({ status: true })
					}
				})
			}
		}).catch((reason) => {
			reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
		})
	})
)