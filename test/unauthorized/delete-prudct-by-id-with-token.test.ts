import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('DELETE /product/:_id with token', () => {
	it('delete ', (done) => {
		request(app)
			.delete('/product/5ea7ac324756fd198887099b')
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body).to.be.an('object').to.contains.all.keys('_id', 'brand', 'name', 'price', 'quantity')
				expect(response.body.quantity).to.equal(2)
				done()
			})
	})
})