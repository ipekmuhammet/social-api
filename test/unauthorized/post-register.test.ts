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
				phoneNumber: '915555555000',
				nameSurname: 'Muhammet İpek',
				password: '1234',
				activationCode: '0000'
			})
			.expect(400)
	))

	it('wrong activation code', () => (
		request(app)
			.post('/register')
			.send({
				phoneNumber: '905555555555',
				nameSurname: 'Muhammet İpek',
				password: '1234',
				activationCode: '0000'
			})
			.expect(400)
	))

	it('without password', () => (
		request(app)
			.post('/register')
			.send({
				phoneNumber: '905555555555',
				nameSurname: 'Muhammet İpek',
				activationCode
			})
			.expect(400)
	))

	it('without nameSurname', () => (
		request(app)
			.post('/register')
			.send({
				phoneNumber: '905555555555',
				activationCode,
				password: '1234'
			})
			.expect(400)
	))

	it('correct', (done) => (
		request(app)
			.post('/register')
			.send({
				phoneNumber: '905555555555',
				nameSurname: 'Muhammet İpek',
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