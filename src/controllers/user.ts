import { Router } from 'express'
import HttpStatusCodes from 'http-status-codes'

import { User } from '../models'
import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import ServerError from '../errors/ServerError'
import { comparePasswords } from './validator'
import ErrorMessages from '../errors/ErrorMessages'

import {
	listCards,
	addCardToUser,
	updateUser,
	saveCart,
	makeOrder,
	deleteAddress
} from '../services/user'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.get('/list-cards', (req, res, next) => {
	// listCards(req.body.cardUserKey)
	listCards('ojBya0o8ecs7ynou3l94xmdB8f8=').then((cards) => {
		res.json(cards)
	}).catch((reason) => {
		next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
	})
})

router.post('/payment-card', (req, res, next) => {
	addCardToUser('ojBya0o8ecs7ynou3l94xmdB8f8=', req.body.card).then((result) => {
		res.json(result)
	}).catch((reason) => {
		next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
	})
})

router.put('/profile', (req, res, next) => {
	// @ts-ignore
	updateUser(req.user._id, req.body).then((user) => {
		res.json(user)
	}).catch((reason) => {
		next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
	})
})

router.post('/cart', (req, res, next) => {
	// @ts-ignore
	saveCart(req.user._id.toString(), req.body).then((result) => {
		res.json(result)
	}).catch((reason) => {
		next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
	})
})

router.get('/cart', (req, res, next) => {
	//  @ts-ignore
	getCart(req.user._id.toString()).then((result) => {
		res.json(result)
	}).catch((reason: any) => {
		next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
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
	deleteAddress(req.user._id, req.params.id).then((result) => {
		res.json(result)
	}).catch((reason) => {
		if (reason.httpCode) {
			next(reason)
		} else {
			next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
		}
	})
})

router.post('/order', (req, res, next) => {
	// @ts-ignore
	makeOrder(req.user._id.toString(), req.body).then((result) => {
		res.json(result)
	}).catch((reason) => {
		if (reason.httpCode) {
			next(reason)
		} else {
			next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, true))
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