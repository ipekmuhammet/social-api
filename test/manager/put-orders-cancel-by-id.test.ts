import request from 'supertest'

import app from '../../src/app'

export default () => describe('PUT /orders/cancel/:_id', () => {
	it('correct', () => {
		const testOrder: any = JSON.parse(process.env.orders).filter((order: any) => JSON.parse(order).customer === 'testUser')[0]

		request(app)
			.put(`/manager/orders/cancel/${testOrder._id}`)
			.set({ Authorization: process.env.managerToken })
			.expect(200)
	})
})