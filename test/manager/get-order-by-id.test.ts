import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

const token = ''
let firstOrder

export default () => describe('GET /manager/order/:id', () => {
	it('correct', (done) => (
		request(app)
			.get(`/manager/order/${firstOrder._id}`)
			.set({ Authorization: token })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}

				expect(response.body).to.be.an('object')
				done()
			})
	))
})