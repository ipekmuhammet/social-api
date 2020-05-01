import JoiBase from '@hapi/joi'
// @ts-ignore
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const sendActivationCodeSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	activationCodeType: Joi.number().min(0).max(3).required()
})

export const registerSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	nameSurname: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(4).required(),
	activationCode: Joi.number().min(1000).max(9999).required()
})

export const registerManagerSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	nameSurname: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(4).required(),
	activationCode: Joi.number().min(1000).max(9999).required()
})

export const loginSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	password: Joi.string().min(4).required()
})

export const resetPasswordSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	newPassword: Joi.string().min(4).required(),
	activationCode: Joi.number().min(1000).max(9999).required()
})