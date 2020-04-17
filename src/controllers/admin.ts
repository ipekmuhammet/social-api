import { Router } from 'express'
import HttpStatusCodes from 'http-status-codes'

import { Category, Product } from '../models'
import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import ServerError from '../errors/ServerError'

const router = Router()

router.use(validateAuthority(Authority.ADMIN))

router.post('/category', (req, res, next) => {
	new Category(req.body).save().then((doc) => {
		res.json(doc)
	}).catch((reason) => {
		next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /admin/category', true))
	})
})

router.put('/category/:id', (req, res, next) => {
	Category.findByIdAndUpdate(req.params.id, req.body).then((doc) => {
		res.json(doc)
	}).catch((reason) => {
		next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /admin/category/:id', true))
	})
})

router.post('/product', (req, res, next) => {
	new Product(req.body).save().then((doc) => {
		res.json(doc)
	}).catch((reason) => {
		next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /admin/product', true))
	})
})

router.put('/product/:id', (req, res, next) => {
	Product.findByIdAndUpdate(req.params.id, req.body).then((doc) => {
		res.json(doc)
	}).catch((reason) => {
		next(new ServerError(reason.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'PUT /admin/product/id', true))
	})
})

router.post('/manager', (req, res, next) => {
	res.end('sa')
})

export default router