// eslint-disable-next-line no-unused-vars
import express, { Application } from 'express'
import morgan from 'morgan'
import winston from 'winston'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import 'dotenv/config'

export default (app: Application) => {
	app.use(express.static(path.join(__dirname, '../../public')))
	app.use(cors())
	app.use(helmet())
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))

	const options = {
		file: {
			level: 'info',
			filename: './logs/all-logs.log',
			handleExceptions: true,
			json: true,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
			colorize: true
		},
		errorFile: {
			level: 'info',
			filename: './logs/error-logs.log',
			handleExceptions: true,
			json: true,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
			colorize: true
		},
		console: {
			level: 'debug',
			handleExceptions: true,
			json: false,
			colorize: true
		}
	}

	const loggerOptions = {
		transports: [
			new winston.transports.File(options.file),
			// new winston.transports.Console(options.console)
		],
		exitOnError: false
	}

	const errorLoggerOptions = {
		transports: [
			new winston.transports.File(options.errorFile),
		],
		exitOnError: false
	}

	const logger = winston.createLogger(loggerOptions)

	winston.loggers.add('logger', loggerOptions)
	winston.loggers.add('error-logger', errorLoggerOptions)

	app.use(
		morgan('combined', {
			stream: {
				write(message: string) {
					logger.info(message)
				}
			}
		})
	)
}