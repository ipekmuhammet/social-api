import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'

import { Product } from './index'

const managerSchema = new Schema({
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
	},
	orders: {
		type: [{
			id: {
				type: String,
				required: true
			},
			customer: {
				type: String,
				required: true
			},
			address: {
				type: String,
				required: true
			},
			date: {
				type: Date,
				required: true
			},
			products: {
				type: [Product],
				required: true
			}
		}],
		required: true
	}
})

// eslint-disable-next-line func-names, consistent-return
managerSchema.pre('save', function (next) { // do not update.
	const manager = this
	if (!manager.isModified('password')) return next()

	// @ts-ignore
	bcrypt.hash(manager.password, 10).then((hash) => {
		// @ts-ignore
		manager.password = hash
		next()
	})
})


export default mongoose.model('Manager', managerSchema)