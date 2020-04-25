import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import { Manager } from '../../src/models'
import { getTestAdminToken } from '../tools'

let testManager
let token

export default () => describe('PUT /verify-manager/:_id', () => {
	beforeAll((done) => {
		getTestAdminToken().then((adminToken) => {
			token = adminToken

			Manager.findOne({ verified: false, phoneNumber: '0555 555 55 55' }).then((manager) => {
				testManager = manager
				done()
			})
		})
	})

	it('correct', (done) => (
		request(app)
			.put(`/admin/verify-manager/${testManager._id}`)
			.set({ Authorization: token })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body._id).to.equal(testManager._id)
				expect(response.body.verified).to.equal(true)
				done()
			})
	))
})