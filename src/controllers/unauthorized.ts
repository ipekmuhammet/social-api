import { Router } from 'express'
import jwt from 'jsonwebtoken'
import Nexmo from 'nexmo'

import { User } from '../models'

const router = Router()

const sendSms = (to: string, message: string) => {
	const smsManager = new Nexmo({
		apiKey: '14efe668',
		apiSecret: 'ivcyJQr7tWmvT4yP',
	})

	const from = 'Platform app'

	smsManager.message.sendSms(from, to, message)
}

router.post('/send-activation-code', (req, res, next) => {
    const activationCode = parseInt(Math.random() * 9999)

	User.findOneAndUpdate({ phone_number: req.body.phone_number }, { activationCode }).then((doc) => {
		if (doc) {
			// sendSms('905468133198', `${activationCode} is your activation code to activate your account.`)

			res.json({ status: true })
		} else {
			new User({ phone_number: req.body.phone_number, activationCode }).save().then(() => {
				// sendSms('905468133198', `${activationCode} is your activation code to activate your account.`)
				res.json({ status: true })
			}).catch((reason) => {
				console.log(reason)
				res.json({ status: false })
			})
		}
	}).catch((reason) => {
		console.log(reason)
		res.json({ status: false })
	})
})

router.post('/login', (req, res, next) => {
	User.findOne({ phone_number: req.body.phone_number }).then((user) => {
		if (user.activationCode === req.body.activationCode) {
			jwt.sign({ payload: user }, 'secret', (err, token) => {
				res.json({ token })
			})
		} else {
			res.status(401).end('Unauthorized')
		}
	})
})

export default router