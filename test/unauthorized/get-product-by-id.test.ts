import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /product/:id', () => {
	it('unknown product', () => {
		request(app)
			.get('/product/12345')
			.expect(400)
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