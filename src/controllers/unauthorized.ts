import { Router } from 'express'
import HttpStatusCodes from 'http-status-codes'

import Authority from '../enums/authority-enum'

// eslint-disable-next-line no-unused-vars
import { validateAuthority, validatePhone } from '../middlewares/auth-middleware'
import ServerError from '../errors/ServerError'

import {
	registerUser,
	registerManager,
	createActivationCode,
	login,
	search,
	getProduct,
	getAllProducts,
	getCategories,
	addProductToCart,
	isManagerVerified,
	handleError,
	checkConvenientOfActivationCodeRequest
} from '../services/unauthorized'

import {
	isUserNonExists,
	isUserExists,
	getActivationCode,
	compareActivationCode,
	isManagerNonExists,
	isManagerExists
} from './validators'

import {
	validateSendActivationCodeRequest,
	validateRegisterRequest,
	validateRegisterManagerRequest,
	validateLoginRequest,
	validateResetPasswordRequest
} from './validators/unauthorized-validator'

import ErrorMessages from '../errors/ErrorMessages'
import ActivationCodes from '../enums/activation-code-enum'
import { Redis } from '../startup'

const router = Router()

router.use(validateAuthority(Authority.ANONIM))
router.use(validatePhone())

router.get('/categories', (req, res, next) => {
	getCategories().then((categories) => {
		res.json(categories)
	}).catch((reason) => {
		next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, reason.isOperational ?? true))
	})
})

router.get('/products', (req, res, next) => {
	getAllProducts().then((products) => {
		res.json(products)
	}).catch((reason) => {
		next(new ServerError(ErrorMessages.UNEXPECTED_ERROR, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, reason.isOperational ?? true))
	})
})

router.get('/product/:id', (req, res, next) => {
	// @ts-ignore
	getProduct(req.params.id, req.user)
		// @ts-ignore
		.then(({ product, cart }) => addProductToCart(req.params.id, product, cart, req.user))
		.then((response) => {
			res.json(response)
		}).catch((reason) => {
			next((handleError(reason, 'POST /product/:id')))
		})
})

router.get('/search-product', (req, res) => {
	search(req.query.name).then((vals: any) => {
		res.json(vals.body.hits.hits)
	})
})

router.post('/send-activation-code', (req, res, next) => {
	validateSendActivationCodeRequest({ phone_number: req.body.phone_number, activationCodeType: req.body.activationCodeType })
		.then(() => checkConvenientOfActivationCodeRequest(req.body.phone_number, req.body.activationCodeType))
		.then(() => createActivationCode(req.body.phone_number, req.body.activationCodeType))
		.then(() => {
			res.status(HttpStatusCodes.ACCEPTED).json({ status: true })
		})
		.catch((reason: any) => {
			next(handleError(reason, 'POST /send-activation-code'))
		})
})

router.post('/register', (req, res, next) => {
	// isUserNonExists(req.body.user.phone_number)
	validateRegisterRequest(req.body)
		.then(() => isUserNonExists(req.body.phone_number))
		.then(() => getActivationCode(req.body.phone_number, ActivationCodes.REGISTER))
		.then((activationCode: string) => compareActivationCode(req.body.activationCode, activationCode))
		.then(() => registerUser(req.body, req.body.phone_number))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /register'))
		})
})

router.post('/register-manager', (req, res, next) => {
	validateRegisterManagerRequest(req.body)
		.then(() => isManagerNonExists(req.body.phoneNumber))
		.then(() => registerManager({ ...req.body, ...{ verified: false } }, req.body.phone_number))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /register-manager'))
		})
})

router.post('/login-manager', (req, res, next) => {
	validateLoginRequest(req.body)
		.then(() => isManagerExists(req.body.phone_number))
		.then((manager) => login(manager, req.body.password))
		.then(({ user, token }) => isManagerVerified(user, { user, token }))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /login-manager'))
		})
})

router.post('/login', (req, res, next) => {
	validateLoginRequest(req.body)
		.then(() => isUserExists(req.body.phone_number))
		.then((user) => login(user, req.body.password))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /login'))
		})
})

router.put('/reset-password', (req, res, next) => {
	validateResetPasswordRequest(req.body)
		.then(() => getActivationCode(req.body.phone_number, ActivationCodes.RESET_PASSWORD))
		.then((activationCode: string) => compareActivationCode(req.body.activationCode, activationCode))
		.then(() => isUserExists(req.body.phone_number))
		.then((user) => {
			// @ts-ignore
			// eslint-disable-next-line no-param-reassign
			user.password = req.body.new_password
			user.save().then(() => {
				Redis.getInstance.del(`${req.body.phone_number}:activationCode:${ActivationCodes.RESET_PASSWORD}`)
				res.json({ status: true })
			})
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /reset-password'))
		})
})

export default router