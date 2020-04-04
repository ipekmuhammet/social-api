/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import Validator from './validator'
import Authority from './authority-enum'

export const validateAuthority = (authority: Authority) => (
	(req: Request, res: Response, next: NextFunction) => {
		const decoded: any = jwt.verify(req.headers.authorization, 'secret')

		//	if (decoded.payload?.authority === authority) {

		// @ts-ignore
		// eslint-disable-next-line no-underscore-dangle
		req.userId = decoded.payload._id
		next()
		//	} else {
		//		res.status(401).end('Unauthorized')
		//	}
	}
)

export const validatePhone = () => (
	(req: Request, res: Response, next: NextFunction) => {
		const { value, error } = Validator.getInstance.validatePhoneNumber({ phone_number: req.body.phone_number })

		if (!error) {
			// @ts-ignore
			req.body.phone_number = value.phone_number
			next()
		} else {
			res.status(400).json({ status: false, error: 'Phone number is invalid.' })
		}
	}
)