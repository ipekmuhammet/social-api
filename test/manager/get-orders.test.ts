import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

const token = ''
let firstOrder

export default () => describe('GET /manager/orders', () => {
	it('correct', (done) => (
		request(app)
			.get('/manager/oders')
			.set({ Authorization: token })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body).to.be.an('array')
				// eslint-disable-next-line prefer-destructuring
				firstOrder = response.body[0]
				done()
			})
	))
})