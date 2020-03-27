import mongoose, { Schema } from 'mongoose'

const productSchema = new Schema({
	category: {
		type: Number
	},
	brand: {
		type: String
	},
	id: {
		type: Number
	},
	kind_name: {
		type: String
	},
	product_name: {
		type: String
	},
	old_price: {
		type: Number
	},
	price: {
		type: Number
	},
	title: {
		type: String
	},
	image: {
		type: String
	},
	units: {
		type: String
	}
})

export default mongoose.model('Product', productSchema)