import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import { getTestAdminToken } from '../tools'
// eslint-disable-next-line no-unused-vars
import { CategoryDocument } from '../../src/models/Category'

let token

export default () => describe('POST /admin/category', () => {
	beforeAll((done) => {
		getTestAdminToken().then((adminToken) => {
			token = adminToken
			done()
		})
	})

	it('correct', (done) => (
		request(app)
			.post('/admin/category')
			.set({ Authorization: token })
			.send({
				id: Math.random(),
				name: 'testCategory'
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.name).to.equal('testCategory')
				done()
			})
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
				expect(Object.values(response.body).some(((category: CategoryDocument) => category.name === 'testCategory'))).to.equal(true)
				done()
			})
	))
})