import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

const token = ''
let firstOrder

export default () => describe('PUT /orders/cancel/:id', () => {
	it('correct', () => (
		request(app)
			.put(`/orders/cancel/${firstOrder._id}`)
			.set({ Authorization: token })
			.expect(200)
	))
})