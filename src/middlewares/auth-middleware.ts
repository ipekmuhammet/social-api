/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'

import Validator from '../controllers/validator'
import Authority from '../enums/authority-enum'

export const validateAuthority = (authority: Authority) => (req: Request, res: Response, next: NextFunction) => {
	if (authority === Authority.ANONIM) {
		if (req.headers.authorization) {
			const decoded: any = jwt.verify(req.headers.authorization, 'secret')

			if (decoded) {
				// @ts-ignore
				req.user = decoded.payload._id
				next()
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
		req.user = decoded.payload
		next()
		//	} else {
		//		res.status(401).end('Unauthorized')
		//	}
	} else {
		res.status(401).end('Unauthorized')
	}
}

export const validatePhone = () => (req: Request, res: Response, next: NextFunction) => {
	const { value, error } = Validator.getInstance.validatePhoneNumber({ phone_number: req.body.phone_number })

	// if (!error && value.phone_number) {
	if (!error) {
		// @ts-ignore
		req.body.phone_number = value.phone_number
		next()
	} else {
		res.status(HttpStatusCodes.BAD_REQUEST).json({ status: false, error: 'Phone number is invalid.' })
	}
}