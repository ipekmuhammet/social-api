import mongoose, { Schema } from 'mongoose'


const categorySchema = new Schema({
	id: { // TODO ??
		type: Number
	},
	name: {
		type: String,
		unique: true
	}
})

export default mongoose.model('Category', categorySchema)