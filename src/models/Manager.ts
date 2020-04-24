// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcrypt'

// eslint-disable-next-line no-unused-vars
import Order, { OrderDocument } from './Order'

export type ManagerDocument = Document & {
	phoneNumber: string,
	nameSurname: string,
	email: string,
	password: string,
	orders: OrderDocument[],
	verified: boolean
}

const managerSchema = new Schema({
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
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	orders: {
		type: [Order.schema],
		required: true
	},
	verified: {
		type: Boolean,
		required: true,
		default: false
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


export default mongoose.model<ManagerDocument>('Manager', managerSchema)