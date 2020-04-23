import request from 'supertest'
// eslint-disable-next-line no-unused-vars
import { expect } from 'chai'
import readline from 'readline'

import app from '../src/app'

const token = ''
let firstOrder


export default () => describe('manager', () => {
	it('GET /manager/orders', (done) => (
		request(app)
			.get('/manager/oders')
			.set({ Authorization: token })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body).to.be.an('array')
				// eslint-disable-next-line prefer-destructuring
				firstOrder = response.body[0]
				done()
			})
	))

	it('GET /manager/order/:id', (done) => (
		request(app)
			.get('/manager/oders')
			.set({ Authorization: token })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}

				expect(response.body).to.be.an('object')
				done()
			})
	))

	it('GET /manager/order/:id', (done) => (
		request(app)
			.get(`/manager/order/${firstOrder._id}`)
			.set({ Authorization: token })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}

				expect(response.body).to.be.an('object')
				done()
			})
	))

	it('PUT /orders/cancel/:id', () => (
		request(app)
			.put(`/orders/cancel/${firstOrder._id}`)
			.set({ Authorization: token })
			.expect(200)
	))

	it('PUT /orders/confirm/:id', () => (
		request(app)
			.put(`/orders/confirm/${firstOrder._id}`)
			.set({ Authorization: token })
			.expect(200)
	))
})