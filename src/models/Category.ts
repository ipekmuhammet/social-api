import mongoose, { Schema } from 'mongoose'


const categorySchema = new Schema({
	id: {
		type: Number
	},
	name: {
		type: String
	}
})

export default mongoose.model('Category', categorySchema)