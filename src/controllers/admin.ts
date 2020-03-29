import { Router } from 'express'

import { Category, Product } from '../models'
import { validateAuthority } from './auth-middleware'
import Authority from './authority-enum'

const router = Router()

router.use(validateAuthority(Authority.ADMIN))

router.post('/saveCategory', (req, res) => {
	new Category(req.body).save().then((doc) => {
		res.json(doc)
	}).catch((reason) => {
		res.json(reason)
	})
})

router.put('/updateCategory/:id', (req, res) => {
	Category.findOneAndUpdate({ id: req.params.id }, req.body).then((doc) => {
		res.json(doc)
	}).catch((reason) => {
		res.json(reason)
	})
})

router.post('/saveProduct', (req, res) => {
	new Product(req.body).save().then((doc) => {
		res.json(doc)
	}).catch((reason) => {
		res.json(reason)
	})
})

router.put('/updateProduct/:id', (req, res) => {
	Product.findOneAndUpdate({ id: req.params.id }, req.body).then((doc) => {
		res.json(doc)
	}).catch((reason) => {
		res.json(reason)
	})
})

router.post('/saveManager', (req, res) => {
	res.end('sa')
})

export default router