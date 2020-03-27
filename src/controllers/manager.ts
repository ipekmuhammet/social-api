import { Router } from 'express'
import Nexmo from 'nexmo'

import { Redis } from '../startup'
import { validateAuthority } from './auth-middleware'
import Authority from './authority-enum'

const router = Router()

// router.use(validateAuthority(Authority.MANAGER))

const sendSms = (to: string, message: string) => {
	const smsManager = new Nexmo({
		apiKey: '14efe668',
		apiSecret: 'ivcyJQr7tWmvT4yP',
	})

	const from = 'Platform app'

	smsManager.message.sendSms(from, to, message)
}

router.get('/orders', (req, res) => {
	// Redis.getInstance.del('category1', Object.keys(Redis.getInstance.hgetall('category1')))
	Redis.getInstance.hgetall('category1', (err, reply) => {
		res.json(reply)
	})
})

router.get('/orders/:id', (req, res) => {
	Redis.getInstance.hget('category1', req.params.id, (err, reply) => {
		res.json(JSON.parse(reply))
	})
})

router.put('/orders/cancel/:id', (req, res) => {
	Redis.getInstance.hget('category1', req.params.id, (err0, reply0) => {
		Redis.getInstance.hset('category1', req.params.id, JSON.stringify(Object.assign(JSON.parse(reply0), { status: false })), (err, reply) => {
			if (err) {
				res.json({ status: false })
			} else {
				// sendSms('905468133198', '21:26 25/03/2020 Tarihinde verdiğiniz. X Siparişi, Y nedeniyle iptal edilmiştir. Ödemeniz en kısa sürece hesabına geri aktarılacaktır. Anlayışınız için teşekkürler.')
				res.json({ status: true })
			}
		})
	})
})

router.put('/orders/confirm/:id', (req, res) => {
	Redis.getInstance.hget('category1', req.params.id, (err0, reply0) => {
		Redis.getInstance.hset('category1', req.params.id, JSON.stringify(Object.assign(JSON.parse(reply0), { status: true })), (err, reply) => {
			if (err) {
				res.json({ status: false })
			} else {
				// sendSms('905468133198', '21:26 25/03/2020 Tarihinde verdiğiniz. X Siparişi, X Kargoya verilmiştir, Kargo takip numarası : 0123456789')
				res.json({ status: true })
			}
		})
	})
})

export default router