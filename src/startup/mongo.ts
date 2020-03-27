import mongoose from 'mongoose'

import { load, test } from '../models/data'

class Mongo {
	/* eslint-disable no-useless-constructor */
	// eslint-disable-next-line no-empty-function
	private constructor() { }

	static connect(url: string) {
		mongoose.connect(url, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })

		mongoose.connection.on('open', () => {
			console.log('Database: Connected.')

			// load()
			// test()
		})

		mongoose.connection.on('error', (error) => {
			console.error('Database: Error', error)
		})

		mongoose.Promise = global.Promise
	}
}

export default Mongo