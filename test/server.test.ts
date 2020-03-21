import request from 'supertest'

import app from '../src/app'

describe('App', () => {
	it('GET /', (done) => {
		request(app)
			.get('/')
			.expect(200)
			.then(({ body }) => {
				console.log('body', body)
				done()
			})
	})
})