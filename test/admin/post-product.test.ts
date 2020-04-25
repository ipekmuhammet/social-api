import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import { getTestAdminToken } from '../tools'

const product = {
	brand: 'Test Marka',
	id: 9999,
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
}

let token

export default () => describe('POST /admin/product', () => {
	beforeAll((done) => {
		getTestAdminToken().then((adminToken) => {
			token = adminToken
			done()
		})
	})

	it('correct', (done) => (
		request(app)
			.post('/admin/product')
			.set({ Authorization: token })
			.send(product)
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.product_name).to.be.equal('Test Product')
				done()
			})
	))
})