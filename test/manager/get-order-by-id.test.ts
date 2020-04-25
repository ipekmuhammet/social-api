import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

let token
let firstOrder

export default () => describe('GET /manager/order/:id', () => {
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

	it('get first order id to test', (done) => (
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
				firstOrder = Object.values(response.body)[0]
				done()
			})
	))

	it('correct', (done) => (
		request(app)
			.get(`/manager/order/${JSON.parse(firstOrder).id}`)
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
})