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
	activationCode: {
		type: String // need nested objects createdTime vs. last 3 minutes ?, when second activation code not created succesfully user can use the first one.
	},
	authority: {
		type: Number
	}
	// cart: {}
})

export default mongoose.model('User', userSchema)