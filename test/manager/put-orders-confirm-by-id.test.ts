import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('PUT /orders/confirm/:_id', () => {
	it('correct', (done) => {
		request(app)
			.put(`/manager/orders/confirm/${process.env.confirmOrder}`)
			.set({ Authorization: process.env.managerToken })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.status).to.equal(true)
				done()
			})
	})
})