import { Router } from 'express'

import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import ErrorMessages from '../errors/ErrorMessages'
import { handleError } from '../services/unauthorized'

import {
	listCards,
	addCardToUser,
	updateUser,
	saveCart,
	saveOrderToCache,
	deleteAddress,
	getCart,
	saveOrderToDatabase,
	checkMakeOrderValues,
	saveAddressToDatabase,
	cacheUser
} from '../services/user'

import {
	comparePasswords
} from '../validators'

import {
	validateUpdateProfileRequest,
	validateSaveCartRequest,
	validateSaveAddressRequest,
	validateChangePasswordRequest,
	validateMakeOrderRequest
} from '../validators/user-validator'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.get('/list-cards', (req, res, next) => {
	// listCards(req.body.cardUserKey)
	listCards('ojBya0o8ecs7ynou3l94xmdB8f8=').then((cards) => {
		res.json(cards)
	}).catch((reason) => {
		next(handleError(reason, 'GET /user/list-cards'))
	})
})

router.post('/payment-card', (req, res, next) => {
	addCardToUser('ojBya0o8ecs7ynou3l94xmdB8f8=', req.body.card).then((result) => {
		res.json(result)
	}).catch((reason) => {
		next(handleError(reason, 'POST /user/payment-card'))
	})
})

router.put('/profile', (req, res, next) => {
	validateUpdateProfileRequest(req.body)
		// @ts-ignore
		.then(() => updateUser(req.user._id, req.body))
		.then((user) => cacheUser(user).then(() => user))
		.then((user) => {
			res.json(user)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /user/profile'))
		})
})

router.post('/cart', (req, res, next) => {
	validateSaveCartRequest(req.body)
		// @ts-ignore
		.then(() => saveCart(req.user._id.toString(), req.body))
		.then((result) => {
			res.json(result)
		}).catch((reason) => {
			next(handleError(reason, 'POST /user/cart'))
		})
})

router.get('/cart', (req, res, next) => {
	//  @ts-ignore
	getCart(req.user._id.toString()).then((result) => {
		res.json(result)
	}).catch((reason) => {
		next(handleError(reason, 'GET /user/cart'))
	})
})

router.post('/address', (req, res, next) => {
	validateSaveAddressRequest(req.body)
		// @ts-ignore
		.then(() => saveAddressToDatabase(req.user._id, req.body))
		.then((user) => cacheUser(user).then(() => user))
		.then((user) => {
			res.json(user)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /user/address'))
		})
})

router.delete('/address/:_id', (req, res, next) => {
	// @ts-ignore
	deleteAddress(req.user._id, req.params._id)
		.then((user) => cacheUser(user).then(() => user))
		.then((user) => {
			res.json(user)
		}).catch((reason) => {
			next(handleError(reason, 'DELETE /user/address/:id'))
		})
})

router.post('/order', (req, res, next) => {
	validateMakeOrderRequest(req.body)
		// @ts-ignore
		.then(() => checkMakeOrderValues(req.user, req.body))
		// @ts-ignore
		.then(({ cart, selectedAddress }) => saveOrderToDatabase(req.user, cart, selectedAddress))
		// @ts-ignore
		.then((order) => saveOrderToCache(req.user, order))
		.then((result) => {
			res.json(result)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /user/order'))
		})
})

router.put('/change-password', (req, res, next) => {
	validateChangePasswordRequest(req.body)
		// @ts-ignore
		.then(() => comparePasswords(req.user.password, req.body.oldPassword, ErrorMessages.WRONG_PASSWORD))
		.then(() => {
			// @ts-ignore
			// eslint-disable-next-line no-param-reassign
			req.user.password = req.body.newPassword
			// @ts-ignore
			req.user.save().then(() => {
				res.json({ status: true })
			})
		}).catch((reason) => {
			next(handleError(reason, 'PUT /user/change-password'))
		})
})

export default router