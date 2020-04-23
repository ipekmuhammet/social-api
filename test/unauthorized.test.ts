import request from 'supertest'
// eslint-disable-next-line no-unused-vars
import { expect } from 'chai'
import readline from 'readline'

import app from '../src/app'
import ActivationCodes from '../src/enums/activation-code-enum'

let activationCode
let resetActivationCode

export default () => describe('Unauthorized', () => {
	describe('Authentication', () => {
		describe('POST /send-activation-code', () => {

			it('without activation code', () => (
				request(app)
					.post('/send-activation-code')
					.send({ phone_number: '905468133193' })
					.expect(400)
			))

			it('unkown activation code type', () => (
				request(app)
					.post('/send-activation-code')
					.send({
						phone_number: '905468133193',
						activationCodeType: 5
					})
					.expect(400)
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

			it('correct', () => (
				request(app)
					.post('/send-activation-code')
					.send({
						phone_number: '905468133193',
						activationCodeType: ActivationCodes.REGISTER_USER
					})
					.expect(202)
			))
		})

		describe('POST /register', () => {
			beforeAll((done) => {
				const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

				rl.question('Enter activation code \n'.repeat(10), (answer) => {
					if (answer.substring(0, 4).length > 3) {
						activationCode = answer.substring(0, 4)
						console.log('Activation Code', activationCode)
						rl.close()
						done()
					}
				})
			})

			it('inconvient phone number', () => (
				request(app)
					.post('/register')
					.send({
						phone_number: '915468133193',
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
						phone_number: '905468133193',
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
						phone_number: '905468133193',
						name_surname: 'Muhammet İpek',
						activation_code: activationCode
					})
					.expect(400)
			))

			it('correct', (done) => (
				request(app)
					.post('/register')
					.send({
						phone_number: '905468133193',
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

		describe('POST /login', () => {
			it('wrong phone_number', () => (
				request(app)
					.post('/login')
					.send({
						phone_number: '905468133199',
						password: '1234'
					})
					.expect(401)
			))

			it('wrong password', () => (
				request(app)
					.post('/login')
					.send({
						phone_number: '905468133193',
						password: '1234x'
					})
					.expect(401)
			))

			it('correct', (done) => (
				request(app)
					.post('/login')
					.send({
						phone_number: '905468133193',
						password: '1234'
					})
					.expect(200)
					// eslint-disable-next-line consistent-return
					.end((err, res) => {
						if (err) {
							return done(err)
						}
						expect(res.body.token).to.be.a('string')
						expect(res.body.user).to.be.a('object')
						done()
					})
			))
		})

		describe('divider', () => {
			it('Send code activation code for reset password', () => (
				request(app)
					.post('/send-activation-code')
					.send({
						phone_number: '905468133193',
						activationCodeType: ActivationCodes.RESET_PASSWORD
					})
					.expect(202)
			))
		})

		describe('PUT /reset-password', () => {
			beforeAll((done) => {
				const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

				rl.question('Enter reset activation code \n'.repeat(10), (answer) => {
					if (answer.substring(0, 4).length > 3) {
						resetActivationCode = answer.substring(0, 4)
						console.log('Activation Code', resetActivationCode)
						rl.close()
						done()
					}
				})
			})

			it('wrong phone_number', () => (
				request(app)
					.put('/reset-password')
					.send({
						phone_number: '905468133199',
						password: '1234'
					})
					.expect(400)
			))

			it('correct', () => (
				request(app)
					.put('/reset-password')
					.send({
						phone_number: '905468133193',
						new_password: '12345',
						activationCode: resetActivationCode
					})
					.expect(200)
			))
		})
	})

	describe('Products', () => {
		it('GET /products', (done) => {
			request(app)
				.get('/products')
				.expect(200)
				.end((err, res) => {
					expect(Object.values(res.body)).to.be.an('array')
					done()
				})
		})

		it('GET /categories', (done) => {
			request(app)
				.get('/categories')
				.expect(200)
				.end((err, res) => {
					expect(Object.values(res.body)).to.be.an('array')
					done()
				})
		})

		it('GET /product/:id', (done) => {
			request(app)
				.get('/product/37695')
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.be.an('object').to.contains.all.keys('_id', 'id', 'brand', 'product_name', 'price')
					done()
				})
		})
	})
})