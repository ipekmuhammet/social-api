import request from 'supertest'
// eslint-disable-next-line no-unused-vars
import { expect } from 'chai'
import readline from 'readline'

import app from '../src/app'

let savedCategory
let savedProduct

const token = ''

describe('admin', () => {
	it('POST /category', (done) => {
		const randomName = Math.random().toString()
		return request(app)
			.post('/admin/category')
			.set({ Authorization: token })
			.send({
				id: Math.random(),
				name: randomName
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.name).to.eq(randomName)
				savedCategory = response.body
				done()
			})
	})

	it('PUT /category/:id', (done) => {
		const randomName = Math.random().toString()
		return request(app)
			.put(`/admin/category/${savedCategory._id}`)
			.set({ Authorization: token })
			.send({
				name: randomName
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.name).to.eq(randomName)
				savedCategory = response.body
				done()
			})
	})

	it('POST /product', (done) => (
		request(app)
			.post('/admin/product')
			.set({ Authorization: token })
			.send({
				brand: 'Test Marka',
				id: Math.random(),
				kind_name: '',
				product_name: 'Test Product',
				old_price: 9,
				price: 9,
				title: 'Test Product - Adet 1',
				category_breadcrumb: 'Test Category',
				images: ['0010544-0.69847100-ulker-finger-biskuvi-multipack-900-gr.jpg'],
				image_types: {
					mini: 'https://cdnd.bizimtoptan.com.tr/product/250x250/',
					thumbnail: 'https://cdnd.bizimtoptan.com.tr/product/480x480/',
					original: 'https://cdnd.bizimtoptan.com.tr/product/1000x1000/'
				},
				unit: 'Adet'
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.product_name).to.be.equal('Test Product')
				savedProduct = response.body
				done()
			})
	))

	it('POST /product', (done) => (
		request(app)
			.post('/admin/product')
			.set({ Authorization: token })
			.send({
				brand: 'Test Marka',
				id: Math.random(),
				kind_name: '',
				product_name: 'Test Product',
				old_price: 9,
				price: 9,
				title: 'Test Product - Adet 1',
				category_breadcrumb: 'Test Category',
				images: ['0010544-0.69847100-ulker-finger-biskuvi-multipack-900-gr.jpg'],
				image_types: {
					mini: 'https://cdnd.bizimtoptan.com.tr/product/250x250/',
					thumbnail: 'https://cdnd.bizimtoptan.com.tr/product/480x480/',
					original: 'https://cdnd.bizimtoptan.com.tr/product/1000x1000/'
				},
				unit: 'Adet'
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.product_name).to.be.equal('Test Product')
				savedProduct = response.body
				done()
			})
	))

	it('PUT /product/:id', (done) => (
		request(app)
			.put(`/admin/product/${savedProduct._id}`)
			.set({ Authorization: token })
			.send({
				brand: 'Test Marka 2'
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.brand).to.be.equal('Test Marka 2')
				done()
			})
	))
})