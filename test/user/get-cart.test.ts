import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

let token

export default () => describe('GET /cart', () => {
	it('login succesfully to get token', (done) => {
		request(app)
			.post('/login')
			.send({
				phone_number: '905555555555',
				password: '12345'
			})
			.expect(200)
			// eslint-disable-next-line consistent-return
			.end((err, res) => {
				if (err) {
					return done(err)
				}
				expect(res.body.token).to.be.a('string')
				expect(res.body.user).to.be.a('object')
				token = res.body.token
				done()
			})
	})

	it('correct', (done) => (
		request(app)
			.get('/user/cart')
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