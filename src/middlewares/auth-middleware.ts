/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'

import { validatePhoneNumber } from '../controllers/validator'
import Authority from '../enums/authority-enum'
import { User } from '../models'

import ServerError from '../errors/ServerError'

export const validateAuthority = (authority: Authority) => (req: Request, res: Response, next: NextFunction) => {
	if (authority === Authority.ANONIM) {
		if (req.headers.authorization) {
			const decoded: any = jwt.verify(req.headers.authorization, 'secret')

			if (decoded) {
				User.findById(decoded.payload._id).then((user) => {
					// @ts-ignore
					req.user = user
					next()
				})
			} else {
				res.status(401).end('Unauthorized')
			}
		} else {
			// @ts-ignore
			req.user = null
			next()
		}
	} else if (req.headers.authorization) {
		const decoded: any = jwt.verify(req.headers.authorization, 'secret')

		//	if (decoded) {

		// @ts-ignore
		User.findById(decoded.payload._id).then((user) => {
			// @ts-ignore
			req.user = user
			next()
		})
		//	} else {
		//		res.status(401).end('Unauthorized')
		//	}
	} else {
		res.status(401).end('Unauthorized')
	}
}

export const validatePhone = () => (req: Request, res: Response, next: NextFunction) => {
	const { value, error } = validatePhoneNumber({ phone_number: req.body.phone_number })

	// if (!error && value.phone_number) {
	if (!error) {
		// @ts-ignore
		req.body.phone_number = value.phone_number
		next()
	} else {
		next(new ServerError('Phone number is invalid.', 400, 'Phone number is invalid.', false))
	}
}