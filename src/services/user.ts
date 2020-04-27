import HttpStatusCodes from 'http-status-codes'
import Iyzipay from 'iyzipay'

import ErrorMessages from '../errors/ErrorMessages'
import ServerError from '../errors/ServerError'
import { User, Order } from '../models'
import { Redis } from '../startup'
// eslint-disable-next-line no-unused-vars
import { UserDocument } from '../models/User'
import { OrderDocument } from 'src/models/Order'

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
		// Redis.getInstance.hdel('cart', userId)
		Redis.getInstance.hgetAsync('cart', userId).then((cart) => {
			resolve(JSON.parse(cart))
		}).catch((reason) => {
			reject(new Error(reason.message))
		})
	})
)

export const deleteAddress = (userId: string, deletedAddressId: string) => (
	User.findByIdAndUpdate(userId, {
		$pull: {
			addresses: {
				_id: deletedAddressId
			}
		}
	}, { new: true })
)

export const checkMakeOrderValues = (user: UserDocument, context: any) => (
	new Promise((resolve, reject) => {
		// @ts-ignore
		const selectedAddress = user.addresses.find((address) => address._id.toString() === context.address)

		// @ts-ignore
		Redis.getInstance.hgetAsync('cart', user._id.toString()).then((cart) => {
			if (!cart) {
				reject(new ServerError(ErrorMessages.EMPTY_CART, HttpStatusCodes.BAD_REQUEST, 'POST /user/order', false))
				// @ts-ignore
			} else if (!selectedAddress) {
				reject(new ServerError(ErrorMessages.NO_ADDRESS, HttpStatusCodes.BAD_REQUEST, 'POST /user/order', false))
			} else {
				try {
					console.log(JSON.parse(cart))
				} catch (error) {
					console.log(error)
				}
				resolve({ cart, selectedAddress })
			}
		}).catch((reason) => {
			reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
		})
	})
)

export const saveOrderToDatabase = (user: UserDocument, cart: any, address: any) => (
	new Order({
		customer: user.nameSurname,
		phoneNumber: user.phoneNumber,
		address: address.openAddress,
		products: Object.values(JSON.parse(cart))
	}).save()
)

export const saveOrderToCache = (user: UserDocument, order: OrderDocument) => (
	new Promise((resolve, reject) => {
		// starts : 2.2 // Müşteri daha önce memnuniyetsizliğini belirttiyse bi güzellik yapılabilir. :)
		// price: (23.43 * 5) + (76.36 * 2), // Online ödemelerde manager'ın ücret ile işi yok.

		const multi = Redis.getInstance.multi()

		multi.hset('orders', order._id.toString(), JSON.stringify(order))

		// @ts-ignore
		multi.hdel('cart', user._id.toString())

		multi.exec((error) => {
			if (error) {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, error.message, true))
			} else {
				resolve(order)
			}
		})
	})
)

export const cacheUser = (user: UserDocument) => (Redis.getInstance.setAsync(user.phoneNumber.toString(), JSON.stringify(user)))

export const getUserFromCache = (phoneNumber: string) => (Redis.getInstance.getAsync(phoneNumber))

export const saveAddressToDatabase = (userId: string, address: any) => (
	User.findByIdAndUpdate(userId, {
		$push: {
			addresses: address
		}
	}, { new: true })
)