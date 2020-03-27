import mongoose, { Schema } from 'mongoose'

import Authority from '../controllers/authority-enum'

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
		type: Number,
		default: Authority.USER
	}
	// cart: {}
})

export default mongoose.model('User', userSchema)