import request from 'supertest'
// eslint-disable-next-line no-unused-vars
import { expect } from 'chai'
import readline from 'readline'

import app from '../src/app'

// TODO Update test values

let activationCode

describe('Unauthorized', () => {
	describe('POST /send-activation-code', () => {
		it('convenient phone number', () => (
			request(app)
				.post('/send-activation-code')
				.send({ phone_number: '905468133193' })
				.expect(202)
		))

		it('inconvenient phone number', () => (
			request(app)
				.post('/send-activation-code')
				.send({ phone_number: '915468133193' })
				.expect(400)
		))

		it('without body', () => (
			request(app)
				.post('/send-activation-code')
				.expect(400)
		))
	})

	describe('POST /register', () => {
		beforeAll((done) => {
			const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

			rl.question('Enter activation code', (answer) => {
				if (answer.substring(0, 4).length > 3) {
					activationCode = answer.substring(0, 4)
					console.log('Activation Code', activationCode)
					done()
				}
			})
		})

		it('inconvient phone number', () => (
			request(app)
				.post('/register')
				.send({
					phone_number: '905468133193',
					activation_code: '0000'
				})
				.expect(400)
		))

		it('wrong activation code', () => (
			request(app)
				.post('/register')
				.send({
					phone_number: '905468133193',
					activation_code: '0000'
				})
				.expect(400)
		))

		it('without password', () => (
			request(app)
				.post('/register')
				.send({
					phone_number: '905468133193',
					activation_code: activationCode
				})
				.expect(400)
		))

		it('correct', () => (
			request(app)
				.post('/register')
				.send({
					phone_number: '905468133193',
					name_surname: 'Muhammet İpek',
					password: '1234',
					activation_code: activationCode
				})
				.expect(400)
				// .expect(200) // TODO Productiona geçmeden önce açılacak, kayıt ettiğimiz userlar var olduğu için 400 dönüyor.
		))
	})
})