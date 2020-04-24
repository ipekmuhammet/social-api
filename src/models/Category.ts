// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type CategoryDocument = Document & {
	id: number,
	name: string
}

const categorySchema = new Schema({
	id: { // TODO ??
		type: Number
	},
	name: {
		type: String,
		unique: true
	}
})

export default mongoose.model<CategoryDocument>('Category', categorySchema)