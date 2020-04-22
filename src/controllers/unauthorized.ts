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
	isManagerVerified
} from '../services/unauthorized'

import {
	isUserNonExists,
	isUserExists,
	getActivationCode,
	compareActivationCode,
	isManagerNonExists,
	isManagerExists
} from './validator'

import ErrorMessages from '../errors/ErrorMessages'

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
			next(new ServerError(reason.message, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /product/:id', reason.isOperational ?? true))
		})
})

router.get('/search-product', (req, res) => {
	search(req.query.name).then((vals: any) => {
		res.json(vals.body.hits.hits)
	})
})

router.post('/send-activation-code', (req, res, next) => {
	createActivationCode(req.body.phone_number)
		.then(() => {
			res.status(HttpStatusCodes.ACCEPTED).json({ status: true })
		})
		.catch((error) => {
			next(error)
		})
})

router.post('/register', (req, res, next) => {
	// isUserNonExists(req.body.user.phone_number)
	isUserNonExists(req.body.phone_number)
		.then(() => getActivationCode(req.body.phone_number))
		.then((activationCode: string) => compareActivationCode(req.body.activationCode, activationCode))
		.then(() => registerUser(req.body, req.body.phone_number))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(new ServerError(reason.message, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, reason.message, reason.isOperational ?? true))
		})
})

router.post('/register-manager', (req, res, next) => {
	isManagerNonExists(req.body.phoneNumber)
		.then(() => registerManager(req.body, req.body.phone_number))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(new ServerError(reason.message, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /login-manager', reason.isOperational ?? true))
		})
})

router.post('/login-manager', (req, res, next) => {
	isManagerExists(req.body.phone_number)
		.then((manager) => login(manager, req.body.password))
		.then(({ user, token }) => isManagerVerified(user, { user, token }))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(new ServerError(reason.message, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /login-manager', reason.isOperational ?? true))
		})
})

router.post('/login', (req, res, next) => {
	isUserExists(req.body.phone_number)
		.then((user) => login(user, req.body.password))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(new ServerError(reason.message, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /login', reason.isOperational ?? true))
		})
})

router.put('/reset-password', (req, res, next) => {
	getActivationCode(req.body.phone_number)
		.then((activationCode: string) => compareActivationCode(req.body.activationCode, activationCode))
		.then(() => isUserExists(req.body.phone_number))
		.then((user) => {
			// @ts-ignore
			// eslint-disable-next-line no-param-reassign
			user.password = req.body.new_password
			user.save().then(() => {
				res.json({ status: true })
			})
		})
		.catch((reason) => {
			next(new ServerError(reason.message, reason.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /reset-password', reason.isOperational ?? true))
		})
})

export default router