import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

let testProduct

export default () => describe('PUT /product/:id', () => {
	it('get product to update', (done) => (
		request(app)
			.get('/product/9999')
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.product_name).to.be.equal('Test Product')
				testProduct = response.body
				done()
			})
	))

	it('correct', () => (
		request(app)
			.put(`/admin/product/${testProduct._id}`)
			.set({ Authorization: process.env.adminToken })
			.send({
				brand: 'Test Marka 2'
			})
			.expect(200)
	))
})