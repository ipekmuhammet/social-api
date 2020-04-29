import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('POST /payment-card', () => {
	it('correct', (done) => (
		request(app)
			.post('/user/payment-card')
			.set({ Authorization: process.env.token })
			.send({
				card: {
					cardAlias: 'deneme cart',
					cardHolderName: 'Muhammet İpek',
					cardNumber: '374427000000003',
					expireMonth: '12',
					expireYear: '2030'
				}
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.status).to.equal('success')
				expect(response.body.lastFourDigits).to.equal('0003')
				process.env.cardToken = response.body.cardToken
				done()
			})
	))
})