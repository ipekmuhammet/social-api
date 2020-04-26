import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
// eslint-disable-next-line no-unused-vars
import { CategoryDocument } from '../../src/models/Category'

let testCategory

export default () => describe('PUT /admin/category/:id', () => {
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
			.set({ Authorization: process.env.adminToken })
			.send({
				name: 'testCategoryUpdated'
			})
			.expect(200)
	))

	it('should categories contain testCategory', (done) => (
		request(app)
			.get('/categories')
			.set({ Authorization: process.env.adminToken })
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