import JoiBase from '@hapi/joi'
// @ts-ignore
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const categorySchema = Joi.object({
	name: Joi.string().required()
})

export const saveProductSchema = Joi.object({
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
	units: Joi.string().allow(null, '')
}).unknown()

// eslint-disable-next-line import/prefer-default-export
export const updateProductSchema = Joi.object({
	brand: Joi.string().optional(),
	kind_name: Joi.string().optional().allow(null, ''),
	product_name: Joi.string().optional(),
	old_price: Joi.string().optional().allow(null, ''),
	price: Joi.string().optional(),
	title: Joi.string().optional(),
	category_breadcrumb: Joi.string().optional().allow(null, ''),
	images: Joi.array().items(Joi.string()).optional(),
	// images: Joi.array().items(Joi.string().required()).required(),
	image_types: Joi.object().optional(),
	units: Joi.string().optional().allow(null, '')
}).required()