import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

let token

export default () => describe('POST /address', () => {
	it('login succesfully to get token', (done) => {
		request(app)
			.post('/login')
			.send({
				phoneNumber: '905555555555',
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
				openAddress: null
			})
			.expect(400)
	))

	it('without openAddress', () => (
		request(app)
			.post('/user/address')
			.set({ Authorization: token })
			.send({
				addressTitle: 'Ev'
			})
			.expect(400)
	))

	it('without addressTitle', () => (
		request(app)
			.post('/user/address')
			.set({ Authorization: token })
			.send({
				openAddress: 'Test Mah.'
			})
			.expect(400)
	))

	it('correct', (done) => (
		request(app)
			.post('/user/address')
			.set({ Authorization: token })
			.send({
				openAddress: 'Test Mah.',
				addressTitle: 'Ev'
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body).to.contains.all.keys('_id')
				// eslint-disable-next-line camelcase
				expect(response.body.addresses.some((address: { openAddress: string }) => (
					address.openAddress === 'Test Mah.'
				))).to.equal(true)
				done()
			})
	))
})