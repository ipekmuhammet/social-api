import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Nexmo from 'nexmo'

import { Redis } from '../startup'
import { User } from '../models'
import Authority from './authority-enum'

const router = Router()

const sendSms = (to: string, message: string) => {
	const smsManager: any = new Nexmo({
		apiKey: '14efe668',
		apiSecret: 'ivcyJQr7tWmvT4yP',
	})

	const from = 'Platform App'

	smsManager.message.sendSms(from, to, message)
}

router.post('/send-activation-code', (req, res) => {
	const activationCode = parseInt(Math.floor(999 + Math.random() * 9000).toString(), 10).toString()
	console.log('activationCode', activationCode)

	Redis.getInstance.hset('activationCode', req.body.phone_number, activationCode, (err) => {
		if (err) {
			res.json({ status: false })
		} else {
			res.json({ status: true })
		}
	})
})

router.post('/register', (req, res) => {
	Redis.getInstance.hget('activationCode', req.body.phone_number, (err, reply) => {
		if (err) {
			console.log(err)
			res.json({ status: false, error: 'Network Error!' })
		} else if (req.body.activation_code === reply) {
			new User(req.body).save().then((user) => {
				// sendSms('905468133198', `${activationCode} is your activation code to activate your account.`)
				console.log(user)
				jwt.sign({ payload: user }, 'secret', (jwtErr: any, token: any) => {
					if (jwtErr) {
						console.log(jwtErr)
						res.json({ status: false })
					} else {
						Redis.getInstance.hdel('activationCode', req.body.phone_number)
						res.json({ token, user })
					}
				})
			}).catch((reason) => {
				console.log(reason)
				res.json({ status: false })
			})
		} else {
			res.status(401).end('Unauthorized')
		}
	})
})


router.post('/login', (req, res) => {
	User.findOne({ phone_number: req.body.phone_number }).then((user) => {
		if (user) {
			// @ts-ignore
			bcrypt.compare(req.body.password, user.password).then((validPassword) => {
				if (!validPassword) {
					res.status(401).end('Unauthorized')
				} else {
					jwt.sign({ payload: user }, 'secret', (jwtErr: any, token: any) => {
						if (jwtErr) {
							console.log(jwtErr)
							res.json({ status: false })
						} else {
							res.json({ token, user })
						}
					})
				}
			})
		} else {
			res.status(401).end('Unauthorized')
		}
	}).catch((reason) => {
		console.log(reason)
		res.status(401).end('Unauthorized')
	})
})

router.put('/change-password', (req, res) => {
	User.findOne({ phone_number: req.body.phone_number }).then((user) => {
		if (user) {
			// @ts-ignore
			bcrypt.compare(req.body.old_password, user.password).then((validPassword) => {
				if (!validPassword) {
					res.status(401).end('Unauthorized')
				} else {
					// @ts-ignore
					// eslint-disable-next-line no-param-reassign
					user.password = req.body.new_password
					user.save().then(() => {
						res.json({ status: true })
					})
				}
			})
		} else {
			res.status(401).end('Unauthorized')
		}
	}).catch((reason) => {
		console.log(reason)
		res.status(401).end('Unauthorized')
	})
})

export default router