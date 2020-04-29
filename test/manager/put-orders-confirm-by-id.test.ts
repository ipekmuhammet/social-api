import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('PUT /orders/confirm/:_id', () => {
	it('correct', (done) => {
		request(app)
			.put(`/manager/orders/confirm/${JSON.parse(process.env.confirmOrder)._id}`)
			.set({ Authorization: process.env.managerToken })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.customer).to.equal('testUser')
				expect(response.body.address).to.equal(JSON.parse(process.env.confirmOrder).address)
				expect(response.body.status).to.equal(true)
				done()
			})
	})
})