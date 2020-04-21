import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'

import { Redis } from '../startup'
import ServerError from '../errors/ServerError'
import { User } from '../models'

export const register = (userContext: any, phoneNumber: string) => (
	new Promise((resolve, reject) => {
		new User(userContext).save().then((user) => {
			// sendSms('905468133198', `${activationCode} is your activation code to activate your account.`)
			jwt.sign({ payload: user }, 'secret', (jwtErr: Error, token: any) => {
				if (jwtErr) {
					reject(new ServerError(jwtErr.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /register', true))
				} else {
					Redis.getInstance.hdel('activationCode', phoneNumber)
					resolve({ token, user })
				}
			})
		}).catch((reason) => {
			reject(new ServerError(reason.message, HttpStatusCodes.BAD_REQUEST, 'POST /register', true))
		})
	})
)

export const login = () => {

}