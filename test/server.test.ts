import request from 'supertest'
import { expect } from 'chai'

import app from '../src/app'

describe('Unauthorized', () => {

	it('POST with convenient phone number to /send-activation-code', () => (
		request(app)
			.post('/send-activation-code')
			.set({ phone_number: '905468133198' })
			.expect(202)
	))

	it('POST with inconvenient phone number to /send-activation-code', () => (
		request(app)
			.post('/send-activation-code')
			.set({ phone_number: '90555555555555555' })
			.expect(400)
	))

	it('POST without body to /send-activation-code', () => (
		request(app)
			.post('/send-activation-code')
			.expect(400)
	))
})