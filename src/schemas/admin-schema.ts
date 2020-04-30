import JoiBase from '@hapi/joi'
// @ts-ignore
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const categorySchema = Joi.object({
	name: Joi.string().required()
}).required()

export const saveProductSchema = Joi.object({
	category: Joi.number().required(),
	brand: Joi.string().required(),
	name: Joi.string().required(),
	price: Joi.number().required()
}).required()

// eslint-disable-next-line import/prefer-default-export
export const updateProductSchema = Joi.object({
	category: Joi.number().allow(null),
	brand: Joi.string().allow(null),
	name: Joi.string().allow(null),
	price: Joi.number().allow(null)
}).required()