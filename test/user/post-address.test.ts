import request from 'supertest'
import { expect } from 'chai'

// eslint-disable-next-line no-unused-vars
import { AddressDocument } from '../../src/models/Address'

import app from '../../src/app'
import { isTextContainsAllKeys } from '../tools'

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

	it('with null address', (done) => (
		request(app)
			.post('/user/address')
			.set({ Authorization: token })
			.send({
				openAddress: null
			})
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(isTextContainsAllKeys(response.body.error, ['openAddress', 'string'])).to.equal(true)
				done()
			})
	))

	it('without openAddress', (done) => (
		request(app)
			.post('/user/address')
			.set({ Authorization: token })
			.send({
				addressTitle: 'Ev'
			})
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(isTextContainsAllKeys(response.body.error, ['openAddress', 'required'])).to.equal(true)
				done()
			})
	))

	it('without addressTitle', (done) => (
		request(app)
			.post('/user/address')
			.set({ Authorization: token })
			.send({
				openAddress: 'Test Mah.'
			})
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(isTextContainsAllKeys(response.body.error, ['address', 'required'])).to.equal(true)
				done()
			})
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
				expect(response.body.addresses.some((address: AddressDocument) => (
					address.openAddress === 'Test Mah.'
				))).to.equal(true)
				done()
			})
	))
})