import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /manager/order/:_id', () => {
	it('correct', (done) => {
		request(app)
			.get(`/manager/order/${process.env.confirmOrder}`)
			.set({ Authorization: process.env.managerToken })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body).to.be.an('object')
				expect(response.body.customer).to.equal('testUser')
				done()
			})
	})
})