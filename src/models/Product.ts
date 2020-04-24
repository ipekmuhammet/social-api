// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type ProductDocument = Document & {
	id: number,
	category: string,
	brand: string,
	kind_name: string, // TODO
	product_name: string, // TODO
	old_price: string, // TODO
	price: number,
	title: string,
	image: string,
	units: string
}

const productSchema = new Schema({
	id: {
		type: Number
	},
	category: {
		type: Number
	},
	brand: {
		type: String
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