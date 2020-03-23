import { Router } from 'express'

const router = Router()

router.post('/saveCategory', (req, res) => {
	res.end('sa')
})

router.post('/saveProduct', (req, res) => {
	res.end('sa')
})

export default router