import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

let token

export default () => describe('POST /address', () => {
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

	it('with no body', () => (
		request(app)
			.post('/user/address')
			.set({ Authorization: token })
			.expect(400)
	))

	it('with null address', () => (
		request(app)
			.post('/user/address')
			.set({ Authorization: token })
			.send({
				open_address: null
			})
			.expect(400)
	))

	it('correct', (done) => (
		request(app)
			.post('/user/address')
			.set({ Authorization: token })
			.send({
				open_address: 'Test Mah.'
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body).to.contains.all.keys('_id')
				done()
			})
	))
})