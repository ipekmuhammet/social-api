import request from 'supertest'

import app from '../../src/app'

export default () => describe('PUT /admin/product/:_id', () => {
	it('correct', () => (
		request(app)
			.put(`/admin/product/${JSON.parse(process.env.testProduct)._id}`)
			.set({ Authorization: process.env.adminToken })
			.send({
				brand: 'Test Marka 2'
			})
			.expect(200)
	))
})