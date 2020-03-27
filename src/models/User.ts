import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
	phone_number: {
		type: String,
		required: true
	},
	addresses: [{
		open_address: {
			type: String
		}
	}],
	authority: {
		type: Number
	}
	// cart: {}
})

export default mongoose.model('User', userSchema)