// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type ProductDocument = Document & {
	category: number,
	brand: string,
	name: string,
	price: number,
	image: number
}

const productSchema = new Schema({
	category: {
		type: Number
	},
	brand: {
		type: String
	},
	name: {
		type: String
	},
	price: {
		type: Number
	},
	image: {
		type: Number,
		default: 0
	}
})

// eslint-disable-next-line func-names
productSchema.pre('save', function (next) {
	const product = this
	if (product.isNew) {
		// eslint-disable-next-line no-use-before-define
		Product.find().sort({ image: -1 }).limit(1).then((total) => {
			// @ts-ignore
			product.image = total.length === 0 ? 0 : total[0].image + 1
			next()
		})
	}
})

const Product = mongoose.model('Product', productSchema)

export default Product