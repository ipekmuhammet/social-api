import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /products', () => {
	it('correct', (done) => {
		request(app)
			.get('/products')
			.expect(200)
			.end((error, res) => {
				if (error) {
					done(error)
				}
				expect(Object.values(res.body)).to.be.an('array')
				process.env.product = JSON.stringify(Object.values(res.body)[0][0])
				done()
			})
	})
})