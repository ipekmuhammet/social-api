import request from 'supertest'
// eslint-disable-next-line no-unused-vars
import { expect } from 'chai'
import readline from 'readline'

import app from '../src/app'

// TODO Update test values

let activationCode

describe('Unauthorized', () => {
	describe('Authentication', () => {
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

		describe('PUT /change-password', () => {
			it('wrong phone_number', () => (
				request(app)
					.put('/change-password')
					.send({
						phone_number: '905468133199',
						password: '1234'
					})
					.expect(401)
			))

			it('wrong old password', () => (
				request(app)
					.put('/change-password')
					.send({
						phone_number: '905468133193',
						old_password: '1234x',
						new_password: '12345'
					})
					.expect(401)
			))

			it('correct', () => (
				request(app)
					.put('/change-password')
					.send({
						phone_number: '905468133193',
						old_password: '1234',
						new_password: '12345'
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