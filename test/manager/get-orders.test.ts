import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /manager/orders', () => {
	it('correct', (done) => (
		request(app)
			.get('/manager/orders')
			.set({ Authorization: process.env.managerToken })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(Object.values(response.body)).to.be.an('array')
				process.env.orders = JSON.stringify(Object.values(response.body))
				done()
			})
	))
})