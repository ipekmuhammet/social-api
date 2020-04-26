import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
// eslint-disable-next-line no-unused-vars
import { ManagerDocument } from '../../src/models/Manager'

export default () => describe('GET /admin/manager-requests', () => {
	it('correct', (done) => {
		request(app)
			.get('/admin/manager-requests')
			.set({ Authorization: process.env.adminToken })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				// eslint-disable-next-line prefer-destructuring
				process.env.manager = JSON.stringify(Object.values(response.body).find((manager: ManagerDocument) => manager.nameSurname === 'testUser'))
				done()
			})
	})
})