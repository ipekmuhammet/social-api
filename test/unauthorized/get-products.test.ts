import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /products', () => {
	it('correct', (done) => {
		request(app)
			.get('/products')
			.expect(200)
			.end((err, res) => {
				expect(Object.values(res.body)).to.be.an('array')
				done()
			})
	})
})