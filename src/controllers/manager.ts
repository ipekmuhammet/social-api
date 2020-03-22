import { Router } from 'express'
import { Category } from '../models'

const router = Router()

router.post('/', (req, res) => {
    //new Category(req.body).save().then((document) => {
    //	res.json(document)
    //})
})

export default router