import bcrypt from 'bcrypt'
import HttpStatusCodes from 'http-status-codes'
import JoiBase from '@hapi/joi'
// @ts-ignore
import JoiPhoneNumber from 'joi-phone-number'

import { Redis } from '../startup'
import { User } from '../models'
import ServerError from '../errors/ServerError'

const Joi = JoiBase.extend(JoiPhoneNumber)

const phoneSchema = Joi.object({
	phone_number: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true })
})

const productSchema = Joi.object({
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

export const validatePhoneNumber = (requestBody: any) => (
	phoneSchema.validate(requestBody)
)

export const validateProducts = (products: any[]) => (
	Joi.array().items(productSchema).sparse(true).validate(products)
)

export const comparePasswords = (oldPassword: string, newPassword: string, errorMessage: string) => (
	bcrypt.compare(oldPassword, newPassword).then((validPassword) => {
		if (!validPassword) {
			throw new Error(errorMessage)
		}
	})
)

/** If User exists, throws Error. */
export const isUserNonExists = (phoneNumber: string) => (
	User.findOne({ phone_number: phoneNumber }).then((foundUser) => {
		if (foundUser) {
			throw new ServerError('User already exists!', HttpStatusCodes.UNAUTHORIZED, 'POST /register', false)
		}
	})
)

/** If User exists, returns It else throws Error. */
export const isUserExists = (phoneNumber: string) => (
	User.findOne({ phone_number: phoneNumber }).then((foundUser) => {
		if (!foundUser) {
			throw new Error('User not exists!')
		} else {
			return foundUser
		}
	})
)

/** Returns activation code of phoneNumber from Redis */
export const getActivationCode = (phoneNumber: string) => (
	new Promise((resolve, reject) => {
		Redis.getInstance.hget('activationCode', phoneNumber, (redisError, reply) => {
			if (redisError || !reply) {
				reject(new ServerError(redisError.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'POST /register', true))
			} else {
				resolve(reply)
			}
		})
	})
)

/** Tests equality of activationCode from request and from Redis */
export const compareActivationCode = (activationCodeFromRequest: string, correctActivationCode: string) => (
	new Promise((resolve, reject) => {
		if (activationCodeFromRequest === correctActivationCode) {
			resolve()
		} else {
			reject(new Error('Wrong activation code!'))
		}
	})
)