import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /list-cards', () => {
	it('correct', (done) => (
		request(app)
			.get('/user/list-cards')
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				//	expect(response.body.status).to.equal('success')
				//	expect(response.body.cardDetails).to.be.an('array')
				//	process.env.cards = JSON.stringify(response.body.cardDetails)
				//	done()
			})
	))
})