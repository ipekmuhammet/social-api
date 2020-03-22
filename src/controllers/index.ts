import { Router } from 'express'

import manager from './manager'
import user from './user'

const router = Router()

router.use('/manager', manager)
router.use('/user', user)

export default router