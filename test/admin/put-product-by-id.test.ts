import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import { getTestAdminToken } from '../tools'

let token
let testProduct

export default () => describe('PUT /product/:id', () => {
	beforeAll((done) => {
		getTestAdminToken().then((adminToken) => {
			token = adminToken
			done()
		})
	})

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
			.set({ Authorization: token })
			.send({
				brand: 'Test Marka 2'
			})
			.expect(200)
	))
})