import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('POST /login', () => {
	it('without phone_number', () => (
		request(app)
			.post('/login')
			.send({
				password: '1234'
			})
			.expect(400)
	))

	it('without password', () => (
		request(app)
			.post('/login')
			.send({
				phone_number: '905555555000'
			})
			.expect(400)
	))

	it('wrong phone_number', () => (
		request(app)
			.post('/login')
			.send({
				phone_number: '905555555000',
				password: '1234'
			})
			.expect(401)
	))

	it('wrong password', () => (
		request(app)
			.post('/login')
			.send({
				phone_number: '905555555555',
				password: '1234x'
			})
			.expect(401)
	))

	it('correct', (done) => (
		request(app)
			.post('/login')
			.send({
				phone_number: '905555555555',
				password: '1234'
			})
			.expect(200)
			// eslint-disable-next-line consistent-return
			.end((err, res) => {
				if (err) {
					return done(err)
				}
				expect(res.body.token).to.be.a('string')
				expect(res.body.user).to.be.a('object')
				done()
			})
	))
})