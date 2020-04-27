import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('PUT /orders/cancel/:_id', () => {
	it('correct', (done) => {
		request(app)
			.put(`/manager/orders/cancel/${process.env.cancelOrder}`)
			.set({ Authorization: process.env.managerToken })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.status).to.equal(false)
				done()
			})
	})
})