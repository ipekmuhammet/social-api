import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /manager/order/:_id', () => {
	it('correct', (done) => {
		const testOrder: any = JSON.parse(JSON.parse(process.env.orders).find((order: any) => JSON.parse(order).customer === 'testUser'))

		request(app)
			.get(`/manager/order/${testOrder._id}`)
			.set({ Authorization: process.env.managerToken })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body).to.be.an('object')
				done()
			})
	})
})