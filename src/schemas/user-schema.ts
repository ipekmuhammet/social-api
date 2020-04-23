import JoiBase from '@hapi/joi'
// @ts-ignore
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const phoneSchema = Joi.object({
	phone_number: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true })
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
	phone_number: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true }),
	email: Joi.string().email(),
	name_surname: Joi.string().required()
})

export const saveCartSchema = Joi.object({
	phone_number: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true }),
	email: Joi.string().email(),
	name_surname: Joi.string().required()
})

export const saveAddressSchema = Joi.object({
	open_address: Joi.string().required()
})

export const changePasswordSchema = Joi.object({
	old_password: Joi.string().min(4).required(),
	new_password: Joi.string().min(4).required()
})