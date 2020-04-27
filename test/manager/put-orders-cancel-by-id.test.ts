import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('PUT /orders/cancel/:_id', () => {
	it('correct', (done) => {
		request(app)
			.put(`/manager/orders/cancel/${JSON.parse(process.env.cancelOrder)._id}`)
			.set({ Authorization: process.env.managerToken })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.customer).to.equal('testUser')
				expect(response.body.address).to.equal(JSON.parse(process.env.cancelOrder).address)
				expect(response.body.status).to.equal(false)
				done()
			})
	})
})