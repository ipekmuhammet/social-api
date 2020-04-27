// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

// eslint-disable-next-line no-unused-vars
import Product, { ProductDocument } from './Product'

export type OrderDocument = Document & {
	id: string,
	customer: string,
	phoneNumber: string,
	address: string,
	date: Date,
	products: ProductDocument[],
	status: boolean
}

const orderSchema = new Schema({
	customer: {
		type: String,
		required: true
	},
	phoneNumber: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		required: true,
		default: Date.now()
	},
	products: {
		type: [
			{
				id: {
					type: Number
				},
				category: {
					type: Number
				},
				brand: {
					type: String
				},
				kindName: {
					type: String
				},
				name: {
					type: String
				},
				oldPrice: {
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
				},
				quantity: {
					type: Number
				}
			}
		],
		required: true
	},
	status: {
		type: Boolean,
		default: null
	}
}, {
	timestamps: true
})

export default mongoose.model<OrderDocument>('Order', orderSchema)