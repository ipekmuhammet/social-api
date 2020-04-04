import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Nexmo from 'nexmo'
import JoiBase from '@hapi/joi'
// @ts-ignore
import JoiPhoneNumber from 'joi-phone-number'

import { Redis } from '../startup'
import { User } from '../models'
import Authority from './authority-enum'

const Joi = JoiBase.extend(JoiPhoneNumber)
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
	const activationCode = parseInt(Math.floor(1000 + Math.random() * 9000).toString(), 10).toString()

	const schema = Joi.object({
		phone_number: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'e164', strict: true })
	})

	const { value, error } = schema.validate({ phone_number: req.body.phone_number })

	if (!error) {
		Redis.getInstance.hset('activationCode', value, activationCode, (redisError) => {
			if (!redisError) {
				res.status(202).json({ status: true })
			} else {
				res.status(500).json({ status: false, error: redisError })
			}
		})
	} else {
		res.status(400).json({ status: false, error: 'Phone number is invalid.' })
	}
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