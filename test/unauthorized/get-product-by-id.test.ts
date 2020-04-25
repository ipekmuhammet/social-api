import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import ErrorMessages from '../../src/errors/ErrorMessages'

export default () => describe('GET /product/:id', () => {
	it('unknown product', (done) => {
		request(app)
			.get('/product/12345')
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.error).to.equal(ErrorMessages.NON_EXISTS_PRODUCT)
				done()
			})
	})

	it('correct', (done) => {
		request(app)
			.get('/product/37695')
			.expect(200)
			.end((err, res) => {
				expect(res.body).to.be.an('object').to.contains.all.keys('_id', 'id', 'brand', 'product_name', 'price')
				done()
			})
	})
})