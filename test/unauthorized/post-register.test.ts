import request from 'supertest'
import readline from 'readline'

import app from '../../src/app'

let activationCode

export default () => describe('POST /register', () => {
	beforeAll((done) => {
		const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

		rl.question('Enter activation code \n'.repeat(10), (answer) => {
			if (answer.substring(0, 4).length > 3) {
				activationCode = answer.substring(0, 4)
				rl.close()
				done()
			}
		})
	})

	it('inconvient phone number', () => (
		request(app)
			.post('/register')
			.send({
				phone_number: '915555555000',
				name_surname: 'Muhammet İpek',
				password: '1234',
				activation_code: '0000'
			})
			.expect(400)
	))

	it('wrong activation code', () => (
		request(app)
			.post('/register')
			.send({
				phone_number: '905555555555',
				name_surname: 'Muhammet İpek',
				password: '1234',
				activation_code: '0000'
			})
			.expect(400)
	))

	it('without password', () => (
		request(app)
			.post('/register')
			.send({
				phone_number: '905555555555',
				name_surname: 'Muhammet İpek',
				activation_code: activationCode
			})
			.expect(400)
	))

	it('without name_surname', () => (
		request(app)
			.post('/register')
			.send({
				phone_number: '905555555555',
				activation_code: activationCode,
				password: '1234'
			})
			.expect(400)
	))

	it('correct', (done) => (
		request(app)
			.post('/register')
			.send({
				phone_number: '905555555555',
				name_surname: 'Muhammet İpek',
				email: `${Math.random()}@hotmail.com`,
				password: '1234',
				activationCode
			})
			.expect(200)
			.end((error) => {
				if (error) {
					done(error)
				}
				done()
			})
	))
})