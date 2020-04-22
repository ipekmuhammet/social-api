import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new Schema({
	phone_number: {
		type: String,
		required: true,
		unique: true
	},
	name_surname: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	addresses: [{
		open_address: {
			type: String,
			required: true
		}
		//	,
		//	type: {
		//		type: Number,
		//		required: true,
		//		default: 0
		//	}
	}]
	// cart: {}
})

// eslint-disable-next-line func-names, consistent-return
userSchema.pre('save', function (next) { // do not update.
	const user = this
	if (!user.isModified('password')) return next()

	// @ts-ignore
	bcrypt.hash(user.password, 10).then((hash) => {
		// @ts-ignore
		user.password = hash
		next()
	})
})


export default mongoose.model('User', userSchema)