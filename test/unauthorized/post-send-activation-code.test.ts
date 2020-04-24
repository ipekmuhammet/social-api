import request from 'supertest'

import app from '../../src/app'
import ActivationCodes from '../../src/enums/activation-code-enum'

export default () => describe('POST /send-activation-code', () => {
	describe('POST /send-activation-code', () => {
		it('without activation code', () => (
			request(app)
				.post('/send-activation-code')
				.send({ phoneNumber: '905555555555' })
				.expect(400)
		))

		it('unkown activation code type', () => (
			request(app)
				.post('/send-activation-code')
				.send({
					phoneNumber: '905555555555',
					activationCodeType: 5
				})
				.expect(400)
		))

		it('inconvenient phone number', () => (
			request(app)
				.post('/send-activation-code')
				.send({ phoneNumber: '905555555000' })
				.expect(400)
		))

		it('without body', () => (
			request(app)
				.post('/send-activation-code')
				.expect(400)
		))

		it('correct', () => (
			request(app)
				.post('/send-activation-code')
				.send({
					phoneNumber: '905555555555',
					activationCodeType: ActivationCodes.REGISTER_USER
				})
				.expect(202)
		))
	})
})