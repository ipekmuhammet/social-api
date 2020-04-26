import request from 'supertest'

import app from '../../src/app'

import getOrdersTests from './get-orders.test'
import getOrderByIdTests from './get-order-by-id.test'
import putOrdersCancelByIdTests from './put-orders-cancel-by-id.test'
import putOrdersConfirmByIdTests from './put-orders-confirm-by-id.test'

export default () => describe('manager', () => {
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
				process.env.managerToken = response.body.token
				done()
			})
	))

	getOrdersTests()
	getOrderByIdTests()
	putOrdersCancelByIdTests()
	putOrdersConfirmByIdTests()
})