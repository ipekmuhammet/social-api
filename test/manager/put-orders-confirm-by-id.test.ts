import request from 'supertest'

import app from '../../src/app'

export default () => describe('PUT /orders/confirm/:_id', () => {
	it('correct', () => {
		const testOrder: any = JSON.parse(process.env.orders).filter((order: any) => JSON.parse(order).customer === 'testUser')[1]

		request(app)
			.put(`/manager/orders/confirm/${testOrder._id}`)
			.set({ Authorization: process.env.managerToken })
			.expect(200)
	})
})