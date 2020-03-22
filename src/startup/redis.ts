import redis from 'redis'
import Promise from 'bluebird'

export default () => {
	const client = Promise.promisifyAll(redis).createClient({ port: 6379 })

	client.on('connect', () => {
		console.log('Redis Connected.')
	})

	client.on('error', (err) => {
		console.log('An error occured', err)
	})

	return client
}