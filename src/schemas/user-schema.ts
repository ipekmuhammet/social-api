import JoiBase from '@hapi/joi'
// @ts-ignore
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const phoneSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true })
})

export const productSchema = Joi.object({
	brand: Joi.string().required(),
	id: [
		Joi.string().required(),
		Joi.number().required()
	],
	kind_name: Joi.string().allow(null, ''),
	product_name: Joi.string().required(),
	old_price: Joi.number().allow(null, ''),
	price: Joi.number().required(),
	title: Joi.string().required(),
	category_breadcrumb: Joi.string().allow(null, ''),
	images: Joi.array().items(Joi.string()).required(),
	// images: Joi.array().items(Joi.string().required()).required(),
	image_types: Joi.object().required(),
	units: Joi.string().allow(null, ''),
	quantity: Joi.number().min(1).required()
}).unknown()

export const updateProfileSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true }),
	email: Joi.string().email(),
	nameSurname: Joi.string().required()
})

export const saveAddressSchema = Joi.object({
	openAddress: Joi.string().required(),
	addressTitle: Joi.string().required(),
	buildingNo: Joi.string().allow(null, ''),
	floor: Joi.string().allow(null, ''),
	aptNo: Joi.string().allow(null, ''),
	directions: Joi.string().allow(null, ''),
})

export const changePasswordSchema = Joi.object({
	oldPassword: Joi.string().min(4).required(),
	newPassword: Joi.string().min(4).required()
})

export const makeOrderSchema = Joi.object({
	address: Joi.string().required(),
	card: Joi.string().required()
})