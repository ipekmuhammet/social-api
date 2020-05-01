import { Router } from 'express'
import HttpStatusCodes from 'http-status-codes'

import Authority from '../enums/authority-enum'

// eslint-disable-next-line no-unused-vars
import { validateAuthority, validatePhone } from '../middlewares/auth-middleware'

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
	checkConvenientOfActivationCodeRequest,
	createToken,
	takeOffProductFromCart
} from '../services/unauthorized'

import {
	isUserNonExists,
	isUserExists,
	getActivationCode,
	compareActivationCode,
	isManagerNonExists,
	isManagerExists
} from '../validators'

import {
	validateSendActivationCodeRequest,
	validateRegisterRequest,
	validateRegisterManagerRequest,
	validateLoginRequest,
	validateResetPasswordRequest
} from '../validators/unauthorized-validator'

import ActivationCodes from '../enums/activation-code-enum'
import { Redis } from '../startup'
import { cacheUser } from '../services/user'

const router = Router()

router.use(validateAuthority(Authority.ANONIM))
router.use(validatePhone())

router.get('/categories', (req, res, next) => {
	getCategories().then((categories) => {
		res.json(categories)
	}).catch((reason) => {
		next(handleError(reason, 'GET /categories'))
	})
})

router.get('/products', (req, res, next) => {
	getAllProducts().then((products) => {
		res.json(products)
	}).catch((reason) => {
		next(handleError(reason, 'GET /products'))
	})
})

router.get('/product/:_id', (req, res, next) => {
	// @ts-ignore
	getProduct(req.params._id, req.user)
		// @ts-ignore
		.then(({ product, cart }) => addProductToCart(JSON.parse(product), cart ? JSON.parse(cart) : null, req.user))
		.then((response) => {
			res.json(response)
		}).catch((reason) => {
			next((handleError(reason, 'POST /product/:_id')))
		})
})

router.delete('/product/:_id', (req, res, next) => {
	// @ts-ignore
	getProduct(req.params._id, req.user)
		// @ts-ignore
		.then(({ product, cart }) => takeOffProductFromCart(JSON.parse(product), cart ? JSON.parse(cart) : null, req.user))
		.then((response) => {
			res.json(response)
		}).catch((reason) => {
			next((handleError(reason, 'POST /product/:_id')))
		})
})

router.get('/search-product', (req, res) => {
	search(req.query.name).then((vals: any) => {
		res.json(vals.body.hits.hits)
	})
})

router.post('/send-activation-code', (req, res, next) => {
	validateSendActivationCodeRequest({ phoneNumber: req.body.phoneNumber, activationCodeType: req.body.activationCodeType })
		.then(() => checkConvenientOfActivationCodeRequest(req.body.phoneNumber, req.body.activationCodeType))
		.then(() => createActivationCode(req.body.phoneNumber, req.body.activationCodeType))
		.then(() => {
			res.status(HttpStatusCodes.ACCEPTED).json({ status: true })
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /send-activation-code'))
		})
})

router.post('/register', (req, res, next) => {
	// isUserNonExists(req.body.user.phoneNumber)
	validateRegisterRequest(req.body)
		.then(() => isUserNonExists(req.body.phoneNumber))
		.then(() => getActivationCode(req.body.phoneNumber, ActivationCodes.REGISTER_USER))
		.then((activationCode: string) => compareActivationCode(req.body.activationCode, activationCode))
		.then(() => registerUser(req.body))
		.then((user) => createToken(user).then((token) => ({ user, token })))
		.then(({ user, token }) => cacheUser(user).then(() => ({ user, token })))
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
		.then(() => getActivationCode(req.body.phoneNumber, ActivationCodes.REGISTER_MANAGER))
		.then((activationCode: string) => compareActivationCode(req.body.activationCode, activationCode))
		.then(() => registerManager({ ...req.body, ...{ verified: false } }))
		.then((manager) => createToken(manager).then((token) => ({ manager, token })))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /register-manager'))
		})
})

router.post('/login-manager', (req, res, next) => {
	validateLoginRequest(req.body)
		.then(() => isManagerExists(req.body.phoneNumber))
		.then((manager) => login(manager, req.body.password))
		.then((manager) => isManagerVerified(manager).then(() => manager))
		.then((manager) => createToken(manager).then((token) => ({ manager, token })))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /login-manager'))
		})
})

router.post('/login', (req, res, next) => {
	validateLoginRequest(req.body)
		.then(() => isUserExists(req.body.phoneNumber))
		.then((user) => login(user, req.body.password))
		.then((user) => cacheUser(user).then(() => user))
		.then((user) => createToken(user).then((token) => ({ user, token })))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /login'))
		})
})

router.put('/reset-password', (req, res, next) => {
	validateResetPasswordRequest(req.body)
		.then(() => isUserExists(req.body.phoneNumber))
		.then(() => getActivationCode(req.body.phoneNumber, ActivationCodes.RESET_PASSWORD))
		.then((activationCode: string) => compareActivationCode(req.body.activationCode, activationCode))
		.then(() => isUserExists(req.body.phoneNumber))
		.then((user) => {
			// @ts-ignore
			// eslint-disable-next-line no-param-reassign
			user.password = req.body.newPassword
			user.save().then(() => {
				Redis.getInstance.del(`${req.body.phoneNumber}:activationCode:${ActivationCodes.RESET_PASSWORD}`)
				res.json({ status: true })
			})
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /reset-password'))
		})
})

export default router