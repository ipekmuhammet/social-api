import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import ErrorMessages from '../../src/errors/ErrorMessages'
import { isTextContainsAllKeys } from '../tools'

const cart = {
	41705: {
		brand: 'ETİ',
		id: 41705,
		kindName: '',
		name: 'Eti Petito Ayıcık 8 Gr  (50 Adet) ',
		oldPrice: 23.22,
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
		kindName: 'Çilek',
		name: 'Nazar Sakız Stick Çilek Aromalı 5 li (20 Adet)',
		oldPrice: 9.94,
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
		kindName: '',
		name: 'Ülker Dido Sütlü Frambuazlı 37 Gr (24 Adet)',
		oldPrice: 32.4,
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

export default () => describe('POST /order', () => {
	it('without address', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				card: 'cardToken' // TODO
			})
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(isTextContainsAllKeys(response.body.error, ['address', 'required'])).to.equal(true)
				done()
			})
	))

	it('without card', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				address: JSON.parse(process.env.user).addresses[0]._id
			})
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(isTextContainsAllKeys(response.body.error, ['card', 'required'])).to.equal(true)
				done()
			})
	))

	it('with empty cart', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				address: JSON.parse(process.env.user).addresses[0]._id,
				card: 'cardToken' // TODO
			})
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.error).to.equal(ErrorMessages.EMPTY_CART)
				done()
			})
	))

	it('POST /cart to make succesfully order', () => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send(cart)
			.expect(200)
	))

	it('with unknown address', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				address: '12345',
				card: 'cardToken' // TODO
			})
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.error).to.equal(ErrorMessages.NO_ADDRESS)
				done()
			})
	))

	it('make order 1', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				address: JSON.parse(process.env.user).addresses[0]._id,
				card: 'cardToken' // TODO
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				process.env.cancelOrder = response.body._id
				done()
			})
	))

	it('POST /cart to make succesfully order 2', () => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send(cart)
			.expect(200)
	))

	it('make order 2', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				address: JSON.parse(process.env.user).addresses[0]._id,
				card: 'cardToken' // TODO
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				process.env.confirmOrder = response.body._id
				done()
			})
	))
}