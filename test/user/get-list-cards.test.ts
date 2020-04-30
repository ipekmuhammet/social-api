import request from 'supertest'

import app from '../../src/app'

export default () => describe('GET /user/list-cards', () => {
	it('correct', (done) => (
		request(app)
			.get('/user/list-cards')
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}
				done()
				//	expect(response.body.status).to.equal('success')
				//	expect(response.body.cardDetails).to.be.an('array')
				//	process.env.cards = JSON.stringify(response.body.cardDetails)
				//	done()
			})
	))
})