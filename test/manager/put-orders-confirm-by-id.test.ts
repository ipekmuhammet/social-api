import request from 'supertest'

import app from '../../src/app'

const token = ''
let firstOrder

export default () => describe('PUT /orders/cancel/:id', () => {
	it('correct', () => (
		request(app)
			.put(`/orders/confirm/${firstOrder._id}`)
			.set({ Authorization: token })
			.expect(200)
	))
})