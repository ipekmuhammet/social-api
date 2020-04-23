/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'

import Authority from '../enums/authority-enum'
import { User, Manager, Admin } from '../models'
import { validatePhoneNumber } from '../controllers/validators/user-validator'

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
				res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
			}
		} else {
			// @ts-ignore
			req.user = null
			next()
		}
	} else if (req.headers.authorization) {
		try {
			const decoded: any = jwt.verify(req.headers.authorization, 'secret')
			if (decoded) {
				if (authority === Authority.USER) {
					// @ts-ignore
					User.findById(decoded.payload._id).then((user) => {
						// @ts-ignore
						req.user = user
						next()
					})
				} else if (authority === Authority.MANAGER) {
					// @ts-ignore
					Manager.findById(decoded.payload._id).then((manager) => {
						// @ts-ignore
						req.manager = manager
						next()
					})
				} else if (authority === Authority.ADMIN) {
					Admin.findById(decoded.payload._id).then((admin) => {
						// @ts-ignore
						req.admin = admin
						next()
					})
				}
			} else {
				res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
			}
		} catch (error) {
			res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
		}
	} else {
		res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
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
		next(new ServerError('Phone number is invalid.', HttpStatusCodes.BAD_REQUEST, 'Phone number is invalid.', false))
	}
}