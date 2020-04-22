import mongoose, { Schema } from 'mongoose'

import { Product } from './index'

const orderSchema = new Schema({
	id: {
		type: String,
		required: true
	},
	customer: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		required: true
	},
	products: {
		type: [Product],
		required: true
	}
})

export default mongoose.model('Order', orderSchema)