import { Router } from 'express'
import HttpStatusCodes from 'http-status-codes'
import jwt from 'jsonwebtoken'

import {
	Category,
	Product,
	Manager,
	Admin
} from '../models'
import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import ServerError from '../errors/ServerError'

const router = Router()

router.use(validateAuthority(Authority.ADMIN))

router.post('/save', (req, res, next) => {
	// Admin.find().then(x => res.json(x))
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
	Manager.findByIdAndUpdate(req.params._id, { verified: true }).then((managers) => {
		res.json(managers)
	})
})

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

export default router