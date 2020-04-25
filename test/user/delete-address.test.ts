import request from 'supertest'
import { expect } from 'chai'

// eslint-disable-next-line no-unused-vars
import { AddressDocument } from '../../src/models/Address'
import app from '../../src/app'

let user
let token

export default () => describe('DELETE /address', () => {
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
				user = res.body.user
				done()
			})
	})

	it('with unknown address', () => (
		request(app)
			.delete(`/user/address/${12345}`)
			.set({ Authorization: token })
			.expect(400)
	))

	it('correct', (done) => (
		request(app)
			.delete(`/user/address/${user.addresses[0]._id}`)
			.set({ Authorization: token })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body).to.contains.all.keys('_id')
				// eslint-disable-next-line camelcase
				expect(response.body.addresses.some((address: AddressDocument) => (
					address._id === user.addresses[0]._id
				))).to.equal(false)
				done()
			})
	))
})