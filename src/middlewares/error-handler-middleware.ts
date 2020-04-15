// eslint-disable-next-line no-unused-vars
import { Request, Response, NextFunction } from 'express'
import winston from 'winston'

// eslint-disable-next-line no-unused-vars
export default (error: Error | any, req: Request, res: Response, next: NextFunction) => {
	winston.loggers.get('logger').error(error)
	res.status(error.httpCode).json({ error: error.name })
}