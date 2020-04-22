import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'

const adminSchema = new Schema({
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
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	}
})

// eslint-disable-next-line func-names, consistent-return
adminSchema.pre('save', function (next) { // do not update.
	const manager = this
	if (!manager.isModified('password')) return next()

	// @ts-ignore
	bcrypt.hash(manager.password, 10).then((hash) => {
		// @ts-ignore
		manager.password = hash
		next()
	})
})


export default mongoose.model('Admin', adminSchema)