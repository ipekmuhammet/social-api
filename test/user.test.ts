import request from 'supertest'
// eslint-disable-next-line no-unused-vars
import { expect } from 'chai'
import readline from 'readline'

import app from '../src/app'

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImF1dGhvcml0eSI6MCwiX2lkIjoiNWU5N2I1NjliYzM2OWUzMGY0OTA1YzJhIiwibmFtZV9zdXJuYW1lIjoibWFtaSIsInBob25lX251bWJlciI6IjkwNTQ2ODEzMzE4MCIsInBhc3N3b3JkIjoiJDJiJDEwJGtsdGpQeXU0UXBlZDdGQ3IzcGJ5amVtSkVmdTNzQ0FOYkQ3ZzA1Y2MxSzFWZm1aZ2FzeU9HIiwiYWRkcmVzc2VzIjpbXSwiX192IjowfSwiaWF0IjoxNTg3MDAwNjgxfQ.v5cbDuT4AKl3rxnraTxzEZ1SN9FmEKRPDVRksZJBAH4'

const cart = {
	41705: {
		brand: 'ETİ',
		id: 41705,
		kind_name: '',
		product_name: 'Eti Petito Ayıcık 8 Gr  (50 Adet) ',
		old_price: 23.22,
		price: 23.22,
		title: 'ETİ Eti Petito Ayıcık 8 Gr  (50 Adet)  - Paket 50',
		category_breadcrumb: 'Atıştırmalık/Bisküvi & Kek & Gofret/Bisküvi',
		images: ['25c95_Eti_Petito_Ayicik_8_Gr__50_Adet_.jpg'],
		image_types: {
			mini: 'https://cdnd.bizimtoptan.com.tr/product/250x250/',
			thumbnail: 'https://cdnd.bizimtoptan.com.tr/product/480x480/',
			original: 'https://cdnd.bizimtoptan.com.tr/product/1000x1000/'
		},
		units: 'Adet',
		quantity: 1
	},
	37999: {
		brand: 'NAZAR',
		id: 37999,
		kind_name: 'Çilek',
		product_name: 'Nazar Sakız Stick Çilek Aromalı 5 li (20 Adet)',
		old_price: 9.94,
		price: 9.94,
		title: 'NAZAR Nazar Sakız Stick Çilek Aromalı 5 li (20 Adet) - Paket 20',
		category_breadcrumb: 'Atıştırmalık/Sakız & Şekerleme/Sakız',
		images: [
			'0023684-0.93289700-nazar-sakiz-stick-cilek-aromali-5-li-20-adet.png',
			'0023684-0.40281600-nazar-sakiz-stick-cilek-aromali-5-li-20-adet.png'
		],
		image_types: {
			mini: 'https://cdnd.bizimtoptan.com.tr/product/250x250/',
			thumbnail: 'https://cdnd.bizimtoptan.com.tr/product/480x480/',
			original: 'https://cdnd.bizimtoptan.com.tr/product/1000x1000/'
		},
		units: 'Adet',
		quantity: 2
	},
	41238: {
		brand: 'ÜLKER ',
		id: 41238,
		kind_name: '',
		product_name: 'Ülker Dido Sütlü Frambuazlı 37 Gr (24 Adet)',
		old_price: 32.4,
		price: 32.4,
		title: 'ÜLKER  Ülker Dido Sütlü Frambuazlı 37 Gr (24 Adet) - Paket 24',
		category_breadcrumb: 'Atıştırmalık/Çikolata & Çikolata Kaplamalı/Çikolata',
		images: [
			'61440_ULKER_DIDO_SUTLU_CIKOLATA_KAPLAMALI_FRAMBUAZLI_40_.jpg',
			'331ba_ULKER_DIDO_SUTLU_CIKOLATA_KAPLAMALI_FRAMBUAZLI_40_.jpg'
		],
		image_types: {
			mini: 'https://cdnd.bizimtoptan.com.tr/product/250x250/',
			thumbnail: 'https://cdnd.bizimtoptan.com.tr/product/480x480/',
			original: 'https://cdnd.bizimtoptan.com.tr/product/1000x1000/'
		},
		units: 'Adet',
		quantity: 4
	}
}

let user

describe('user', () => {
	it('POST /order with empty cart', () => (// May this test not pass, should try with new created user.
		request(app)
			.post('/user/order')
			.set({ Authorization: token })
			.send({
				address: 0
			})
			.expect(400)
	))

	it('POST /cart', () => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: token })
			.send(cart)
			.expect(200)
	))

	it('GET /cart', (done) => (
		request(app)
			.get('/user/cart')
			.set({ Authorization: token })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}

				expect(response.body).to.be.an('object')
				done()
			})
	))

	it('POST /address', (done) => (
		request(app)
			.post('/user/address')
			.set({ Authorization: token })
			.send({
				open_address: 'Test Mah.'
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body).to.contains.all.keys('_id')
				user = response.body
				done()
			})
	))

	it('POST /order', () => (
		request(app)
			.post('/user/order')
			.set({ Authorization: token })
			.send({
				address: user.addresses[0]._id
			})
			.expect(200)
	))

	it('DELETE /address', () => (
		request(app)
			.delete('/user/address')
			.set({ Authorization: token })
			.send({
				_id: 12345
			})
			.expect(400)
	))

	it('DELETE /address', () => (
		request(app)
			.delete('/user/address')
			.set({ Authorization: token })
			.send({
				_id: user.addresses[0]._id
			})
			.expect(200)
	))
})