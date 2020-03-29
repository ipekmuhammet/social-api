/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import Authority from './authority-enum'

// eslint-disable-next-line import/prefer-default-export
export const validateAuthority = (authority: Authority) => {
	return (req: Request, res: Response, next: NextFunction) => {
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
}