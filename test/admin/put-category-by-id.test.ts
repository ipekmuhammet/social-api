import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
// eslint-disable-next-line no-unused-vars
import { CategoryDocument } from '../../src/models/Category'

export default () => describe('PUT /admin/category/:_id', () => {
	it('correct', () => (
		request(app)
			.put(`/admin/category/${JSON.parse(process.env.testCategory)._id}`)
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