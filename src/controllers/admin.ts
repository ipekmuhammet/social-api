import { Router } from 'express'
import { Category, Product } from '../models'

const router = Router()

router.post('/saveCategory', (req, res) => {
	new Category(req.body).save().then((doc) => {
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

router.post('/saveManager', (req, res) => {
	res.end('sa')
})

export default router