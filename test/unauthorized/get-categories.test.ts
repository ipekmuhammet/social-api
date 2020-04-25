import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /categories', () => {
	it('correct', (done) => {
		request(app)
			.get('/categories')
			.expect(200)
			.end((error, res) => {
				if (error) {
					done(error)
				}
				expect(Object.values(res.body)).to.be.an('array')
				done()
			})
	})
})