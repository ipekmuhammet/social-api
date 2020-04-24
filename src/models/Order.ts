// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

// eslint-disable-next-line no-unused-vars
import Product, { ProductDocument } from './Product'

export type OrderDocument = Document & {
	id: string,
	customer: string,
	address: string,
	date: Date,
	products: ProductDocument[]
}

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
		type: [Product.schema],
		required: true
	}
})

export default mongoose.model<OrderDocument>('Order', orderSchema)