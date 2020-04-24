import request from 'supertest'
import readline from 'readline'

import app from '../../src/app'

let resetActivationCode

export default () => describe('PUT /reset-password', () => {
	beforeAll((done) => {
		const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

		rl.question('Enter reset activation code \n'.repeat(10), (answer) => {
			if (answer.substring(0, 4).length > 3) {
				resetActivationCode = answer.substring(0, 4)
				rl.close()
				done()
			}
		})
	})

	it('without phone_number', () => (
		request(app)
			.put('/reset-password')
			.send({
				password: '1234'
			})
			.expect(400)
	))

	it('without password', () => (
		request(app)
			.put('/reset-password')
			.send({
				phone_number: '905555555555'
			})
			.expect(400)
	))

	it('wrong phone_number', () => (
		request(app)
			.put('/reset-password')
			.send({
				phone_number: '905555555000',
				password: '1234'
			})
			.expect(400)
	))

	it('correct', () => (
		request(app)
			.put('/reset-password')
			.send({
				phone_number: '905555555555',
				new_password: '12345',
				activationCode: resetActivationCode
			})
			.expect(200)
	))
})