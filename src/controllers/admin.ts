import { Router } from 'express'
import HttpStatusCodes from 'http-status-codes'
import jwt from 'jsonwebtoken'

import {
	Manager,
	Admin
} from '../models'

import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import ServerError from '../errors/ServerError'
import { validatePostProduct, validateUpdateProduct } from '../validators/admin-validator'
import {
	saveProductToDatabase,
	saveProductToCache,
	updateProduct,
	updateCategory,
	saveCategoryToCache,
	saveCategoryToDatabase,
	verifyManager
} from '../services/admin'

const router = Router()

router.use(validateAuthority(Authority.ADMIN))

router.post('/save', (req, res, next) => {
	new Admin(req.body).save().then((admin) => {
		jwt.sign({ payload: admin }, 'secret', (jwtErr: Error, token: any) => {
			if (jwtErr) {
				next(jwtErr.message)
			} else {
				res.end(token)
			}
		})
	})
})

router.get('/manager-requests', (req, res) => {
	Manager.find({ verified: false }).then((managers) => {
		res.json(managers)
	})
})

router.get('/managers', (req, res) => {
	Manager.find().then((managers) => {
		res.json(managers)
	})
})

router.put('/verify-manager/:_id', (req, res) => {
	verifyManager(req.params._id).then((manager) => {
		res.json(manager)
	})
})

router.post('/category', (req, res, next) => {
	saveCategoryToDatabase(req.body)
		.then((category) => saveCategoryToCache(category))
		.then((category) => {
			res.json(category)
		})
		.catch((reason) => {
			next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /admin/category', true))
		})
})

router.put('/category/:_id', (req, res, next) => {
	updateCategory(req.params._id, req.body)
		.then((category) => saveCategoryToCache(category))
		.then((category) => {
			res.json(category)
		})
		.catch((reason) => {
			next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /admin/category/:_id', true))
		})
})

router.post('/product', (req, res, next) => {
	validatePostProduct(req.body)
		.then(() => saveProductToDatabase(req.body))
		.then((product) => saveProductToCache(product))
		.then((product) => {
			res.json(product)
		})
		.catch((reason) => {
			next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /admin/product', true))
		})
})

router.put('/product/:_id', (req, res, next) => {
	validateUpdateProduct(req.body)
		.then(() => updateProduct(req.params._id, req.body))
		.then((product) => saveProductToCache(product))
		.then((product) => {
			res.json(product)
		})
		.catch((reason) => {
			next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /admin/product/:_id', true))
		})
})

export default router