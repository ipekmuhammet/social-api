// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcrypt'

export type UserDocument = Document & {
	phoneNumber: string,
	nameSurname: string,
	email: string,
	password: string,
	addresses: { openAddress: string }[]
}

const userSchema = new Schema({
	phoneNumber: {
		type: String,
		required: true,
		unique: true
	},
	nameSurname: {
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
		openAddress: {
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
}, {
	timestamps: true
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


export default mongoose.model<UserDocument>('User', userSchema)