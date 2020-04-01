import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'

import Authority from '../controllers/authority-enum'

const userSchema = new Schema({
	phone_number: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
		minlength: 4,
		maxlength: 20
	},
	addresses: [{
		open_address: {
			type: String
		}
	}],
	authority: {
		type: Authority,
		default: Authority.USER,
		required: true
	}
	// cart: {}
})

// eslint-disable-next-line func-names, consistent-return
userSchema.pre('save', function (next) {
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