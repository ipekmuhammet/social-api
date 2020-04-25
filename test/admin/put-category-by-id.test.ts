import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
// eslint-disable-next-line no-unused-vars
import { CategoryDocument } from '../../src/models/Category'
import { getTestAdminToken } from '../tools/index'

let testCategory
let token

export default () => describe('PUT /admin/category/:id', () => {
	beforeAll((done) => {
		getTestAdminToken().then((adminToken) => {
			token = adminToken
			done()
		})
	})

	it('get test category to update', (done) => {
		request(app)
			.get('/categories')
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				// eslint-disable-next-line prefer-destructuring
				testCategory = Object.values(response.body).find((category: CategoryDocument) => category.name === 'testCategory')
				done()
			})
	})

	it('correct', (done) => (
		request(app)
			.put(`/admin/category/${testCategory._id}`)
			.set({ Authorization: token })
			.send({
				name: 'randomName'
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.name).to.equal('randomName')
				done()
			})
	))
})