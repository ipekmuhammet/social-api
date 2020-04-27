import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

const product = {
	brand: 'Test Marka',
	id: 9999,
	kindName: '',
	name: 'Test Product',
	oldPrice: 9,
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
}

export default () => describe('POST /admin/product', () => {
	it('correct', (done) => (
		request(app)
			.post('/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send(product)
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.name).to.be.equal('Test Product')
				process.env.testProduct = JSON.stringify(response.body)
				done()
			})
	))
})