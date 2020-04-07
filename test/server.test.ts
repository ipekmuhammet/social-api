import request from 'supertest'
import { expect } from 'chai'

import app from '../src/app'

describe('Unauthorized', () => {
	describe('POST /send-activation-code', () => {
		it('with convenient phone number', () => (
			request(app)
				.post('/send-activation-code')
				.set({ phone_number: '905468133198' })
				.expect(202)
		))

		it('inconvenient phone number', () => (
			request(app)
				.post('/send-activation-code')
				.set({ phone_number: '915468133198' })
				.expect(400)
		))

		it('without body', () => (
			request(app)
				.post('/send-activation-code')
				.expect(400)
		))
	})

	describe('POST /send-activation-code', () => {
		it('POST without body to /send-activation-code', () => (
			request(app)
				.post('/send-activation-code')
				.expect(400)
		))
	})
})