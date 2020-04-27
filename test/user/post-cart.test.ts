import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import { isTextContainsAllKeys } from '../tools'

const singleProduct = {
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
}

const brokenProducts = {
	noBrand: { ...singleProduct, brand: undefined },
	noName: { ...singleProduct, name: undefined },
	noPrice: { ...singleProduct, price: undefined },
	noTitle: { ...singleProduct, title: undefined },
	noQuantity: { ...singleProduct, quantity: undefined }
}

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

export default () => describe('POST /cart', () => {
	it('with no brand product', (done) => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send({ ...cart, ...{ 12345: brokenProducts.noBrand } })
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(isTextContainsAllKeys(response.body.error, ['brand', 'required'])).to.equal(true)
				done()
			})
	))

	it('with no name product', (done) => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send({ ...cart, ...{ 12345: brokenProducts.noName } })
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(isTextContainsAllKeys(response.body.error, ['name', 'required'])).to.equal(true)
				done()
			})
	))

	it('with no name price', (done) => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send({ ...cart, ...{ 12345: brokenProducts.noPrice } })
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(isTextContainsAllKeys(response.body.error, ['price', 'required'])).to.equal(true)
				done()
			})
	))

	it('with no name title', (done) => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send({ ...cart, ...{ 12345: brokenProducts.noTitle } })
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(isTextContainsAllKeys(response.body.error, ['title', 'required'])).to.equal(true)
				done()
			})
	))

	it('with no quantity price', (done) => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send({ ...cart, ...{ 12345: brokenProducts.noQuantity } })
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(isTextContainsAllKeys(response.body.error, ['quantity', 'required'])).to.equal(true)
				done()
			})
	))

	it('correct', () => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send(cart)
			.expect(200)
	))
}