import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /manager/order/:id', () => {
	it('correct', (done) => {
		const testOrder: any = JSON.parse(process.env.orders).find((order: any) => JSON.parse(order).customer === 'testUser')

		return request(app)
			.get(`/manager/order/${testOrder.id}`)
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