import { Router } from 'express'
import HttpStatusCodes from 'http-status-codes'

import { User } from '../models'
import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import ServerError from '../errors/ServerError'
import ErrorMessages from '../errors/ErrorMessages'
import { handleError } from '../services/unauthorized'

import {
	listCards,
	addCardToUser,
	updateUser,
	saveCart,
	makeOrder,
	deleteAddress,
	getCart
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

// eslint-disable-next-line no-unused-vars
import { UserDocument } from '../models/User'


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
		.then((user) => {
			res.json(user)
		}).catch((reason) => {
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
		.then(() => User.findById(req.user._id))
		.then((user: UserDocument) => {
			if (user) {
				user.addresses.push(req.body)
				user.save().then((result: any) => {
					res.json(result)
				})
			} else {
				next(
					handleError(
						new ServerError(ErrorMessages.USER_IS_NOT_EXISTS, HttpStatusCodes.BAD_REQUEST, 'POST /user/address', true),
						'POST /user/address'
					)
				)
			}
		}).catch((reason) => {
			next(handleError(reason, 'POST /user/address'))
		})
})

router.delete('/address/:id', (req, res, next) => {
	// @ts-ignore
	deleteAddress(req.user._id, req.params.id).then((result) => {
		res.json(result)
	}).catch((reason) => {
		if (reason.httpCode) {
			next(reason)
		} else {
			next(handleError(reason, 'DELETE /user/address/:id'))
		}
	})
})

router.post('/order', (req, res, next) => {
	validateMakeOrderRequest(req.body)
		// @ts-ignore
		.then(() => makeOrder(req.user, req.body))
		.then((result) => {
			res.json(result)
		}).catch((reason) => {
			next(handleError(reason, 'POST /user/order'))
		})
})

router.put('/change-password', (req, res, next) => {
	validateChangePasswordRequest(req.body)
		// @ts-ignore
		.then(() => comparePasswords(req.body.oldPassword, req.user.password, ErrorMessages.WRONG_PASSWORD))
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