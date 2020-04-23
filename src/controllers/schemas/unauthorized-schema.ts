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
		Joi.number().required(),
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

export const sendActivationCodeSchema = Joi.object({
	phone_number: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true }).required(),
	activationCodeType: Joi.number().min(1).max(2).required()
})

export const registerSchema = Joi.object({
	phone_number: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true }).required(),
	name_surname: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(4).required(),
	activationCodeType: Joi.number().equal(0).required()
})

export const registerManagerSchema = Joi.object({
	phone_number: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true }).required(),
	name_surname: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(4).required(),
	// activationCodeType: Joi.number().equal(2).required() // TODO
})

export const loginSchema = Joi.object({
	phone_number: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true }).required(),
	password: Joi.string().min(4).required()
})

export const resetPasswordSchema = Joi.object({
	phone_number: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true }).required(),
	new_password: Joi.string().min(4).required(),
	activationCode: Joi.number().min(1000).max(9999).required(),
	activationCodeType: Joi.number().equal(1).required(),
})