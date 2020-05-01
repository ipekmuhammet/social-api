import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import ErrorMessages from '../../src/errors/ErrorMessages'

export default () => describe('DELETE /product/:_id', () => {
	it('unknown product', (done) => {
		request(app)
			.delete('/product/12356')
			.expect(400)
			.end((error, response) => {
				expect(response.body.error).to.equal(ErrorMessages.NON_EXISTS_PRODUCT)
				done()
			})
	})

	it('delete ', (done) => {
		request(app)
			.delete('/product/5ea7ac324756fd198887099b')
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body).to.be.an('object').to.contains.all.keys('_id', 'brand', 'name', 'price')
				done()
			})
	})
})