import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

let token
let testOrder

export default () => describe('PUT /orders/confirm/:id', () => {
	it('login to get token', (done) => (
		request(app)
			.post('/login-manager')
			.send({
				phoneNumber: '555 555 55 55',
				password: '1234'
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				token = response.body.token
				done()
			})
	))

	it('get test order id to test', (done) => (
		request(app)
			.get('/manager/orders')
			.set({ Authorization: token })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(Object.values(response.body)).to.be.an('array')
				// eslint-disable-next-line prefer-destructuring
				testOrder = Object.values(response.body).filter((order: any) => JSON.parse(order).customer === 'testUser')[1]
				done()
			})
	))

	it('correct', () => (
		request(app)
			.put(`/manager/orders/confirm/${JSON.parse(testOrder).id}`)
			.set({ Authorization: token })
			.expect(200)
	))
})