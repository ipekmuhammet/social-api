import mongoose from 'mongoose'
import winston from 'winston'

import { load, test } from '../models/data'

class Mongo {
	/* eslint-disable no-useless-constructor */
	// eslint-disable-next-line no-empty-function
	private constructor() { }

	static connect(url: string) {
		mongoose.connect(url, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true })

		mongoose.connection.on('open', () => {
			winston.loggers.get('logger').info('Database: Connected.')

			// load()
			// test()
		})

		mongoose.connection.on('error', (error) => {
			winston.loggers.get('logger').error('Database: Error', error)
		})

		mongoose.Promise = global.Promise
	}
}

export default Mongo