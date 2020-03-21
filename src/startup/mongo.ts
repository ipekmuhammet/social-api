import mongoose from 'mongoose'

export default () => {
	mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
	mongoose.connection.on('open', () => {
		console.log('Database: Connected.')
	})

	mongoose.connection.on('error', (error) => {
		console.error('Database: Error', error)
	})

	mongoose.Promise = global.Promise
}