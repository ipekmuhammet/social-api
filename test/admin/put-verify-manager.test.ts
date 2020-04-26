import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('PUT /verify-manager/:_id', () => {
	it('correct', (done) => (
		request(app)
			.put(`/admin/verify-manager/${JSON.parse(process.env.manager)._id}`)
			.set({ Authorization: process.env.adminToken })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body._id).to.equal(JSON.parse(process.env.manager)._id)
				done()
			})
	))
})