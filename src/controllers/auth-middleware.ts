/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import Authority from './authority-enum'

// eslint-disable-next-line import/prefer-default-export
export const validateAuthority = (authority: Authority) => (req: Request, res: Response, next: NextFunction) => {
	if (authority === Authority.ANONIM) {
		if (req.headers.authorization) {
			const decoded: any = jwt.verify(req.headers.authorization, 'secret')

			if (decoded) {
				// @ts-ignore
				// eslint-disable-next-line no-underscore-dangle
				req.userId = decoded.payload._id
				next()
			} else {
				res.status(401).end('Unauthorized')
			}
		} else {
			// @ts-ignore
			req.userId = null
			next()
		}
	} else if (req.headers.authorization) {
		const decoded: any = jwt.verify(req.headers.authorization, 'secret')

		//	if (decoded) {

		// @ts-ignore
		// eslint-disable-next-line no-underscore-dangle
		req.userId = decoded.payload._id
		next()
		//	} else {
		//		res.status(401).end('Unauthorized')
		//	}
	} else {
		res.status(401).end('Unauthorized')
	}
}