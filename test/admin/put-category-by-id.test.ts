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

	it('correct', () => (
		request(app)
			.put(`/admin/category/${testCategory._id}`)
			.set({ Authorization: token })
			.send({
				name: 'testCategoryUpdated'
			})
			.expect(200)
	))

	it('should categories contain testCategory', (done) => (
		request(app)
			.get('/categories')
			.set({ Authorization: token })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(Object.values(response.body).some(((category: CategoryDocument) => category.name === 'testCategoryUpdated'))).to.equal(true)
				done()
			})
	))
})