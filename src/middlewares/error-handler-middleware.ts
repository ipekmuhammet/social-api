import HttpStatusCodes from 'http-status-codes'
// eslint-disable-next-line no-unused-vars
import { Request, Response, NextFunction } from 'express'
import winston from 'winston'
import ErrorMessages from '../errors/ErrorMessages'

// eslint-disable-next-line no-unused-vars
export default (error: Error | any, req: Request, res: Response, next: NextFunction) => {
	winston.loggers.get('logger').error('', error)
	if (error.httpCode) {
		res.status(error.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.name, errorCode: error.errorCode })
	} else {
		res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.UNEXPECTED_ERROR })
	}
}