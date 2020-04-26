import request from 'supertest'
import { expect } from 'chai'

// eslint-disable-next-line no-unused-vars
import { AddressDocument } from '../../src/models/Address'
import app from '../../src/app'

export default () => describe('DELETE /address', () => {
	it('with unknown address', () => (
		request(app)
			.delete(`/user/address/${12345}`)
			.set({ Authorization: process.env.token })
			.expect(400)
	))

	it('correct', (done) => (
		request(app)
			.delete(`/user/address/${JSON.parse(process.env.user).addresses[0]._id}`)
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body).to.contains.all.keys('_id')
				// eslint-disable-next-line camelcase
				expect(response.body.addresses.some((address: AddressDocument) => (
					address._id === JSON.parse(process.env.user).addresses[0]._id
				))).to.equal(false)
				done()
			})
	))
}