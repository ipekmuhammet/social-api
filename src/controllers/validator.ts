import bcrypt from 'bcrypt'
import HttpStatusCodes from 'http-status-codes'
import Joi from '@hapi/joi'

import { Redis } from '../startup'
import { User, Manager } from '../models'
import ServerError from '../errors/ServerError'
import ErrorMessages from '../errors/ErrorMessages'
// eslint-disable-next-line no-unused-vars
import ActivationCodes from '../enums/activation-code-enum'

import {
	phoneSchema,
	productSchema,
	sendActivationCodeSchema,
	registerSchema,
	registerManagerSchema,
	loginSchema,
	resetPasswordSchema
} from './joi-schemas'

export const validateSendActivationCodeRequest = (context: any) => (
	sendActivationCodeSchema.validateAsync(context)
)

export const validateRegisterRequest = (context: any) => (
	registerSchema.validateAsync(context)
)

export const validateRegisterManagerRequest = (context: any) => (
	registerManagerSchema.validateAsync(context)
)

export const validateLoginRequest = (context: any) => (
	loginSchema.validateAsync(context)
)

export const validateResetPasswordRequest = (context: any) => (
	resetPasswordSchema.validateAsync(context)
)

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
export const isManagerNonExists = (phoneNumber: string) => (
	Manager.findOne({ phone_number: phoneNumber }).then((foundManager) => {
		if (foundManager) {
			throw new ServerError(null, HttpStatusCodes.BAD_REQUEST, ErrorMessages.MANAGER_ALREADY_EXISTS, false)
		}
	})
)

/** If User not exists, throws Error. */
export const isManagerExists = (phoneNumber: string) => (
	Manager.findOne({ phone_number: phoneNumber }).then((foundManager) => {
		if (!foundManager) {
			throw new ServerError(null, HttpStatusCodes.UNAUTHORIZED, ErrorMessages.MANAGER_IS_NOT_EXISTS, false)
		} else {
			return foundManager
		}
	})
)

/** If User exists, throws Error. */
export const isUserNonExists = (phoneNumber: string) => (
	User.findOne({ phone_number: phoneNumber }).then((foundUser) => {
		if (foundUser) {
			throw new ServerError(ErrorMessages.USER_ALREADY_EXISTS, HttpStatusCodes.BAD_REQUEST, null, false)
		}
	})
)

/** If User exists, returns It else throws Error. */
export const isUserExists = (phoneNumber: string) => (
	User.findOne({ phone_number: phoneNumber }).then((foundUser) => {
		if (!foundUser) {
			throw new ServerError(ErrorMessages.USER_IS_NOT_EXISTS, HttpStatusCodes.UNAUTHORIZED, null, false)
		} else {
			return foundUser
		}
	})
)

/** Returns activation code of phoneNumber from Redis */
export const getActivationCode = (phoneNumber: string, activationCodeType: ActivationCodes) => (
	new Promise((resolve, reject) => {
		// @ts-ignore
		Redis.getInstance.get(`${phoneNumber}:activationCode:${activationCodeType}`, (redisError, reply) => {
			if (!reply) {
				reject(new ServerError(null, HttpStatusCodes.INTERNAL_SERVER_ERROR, 'Aktivasyon kodu bulunamadı!', false))
			} else if (redisError) {
				reject(new ServerError(redisError?.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, ErrorMessages.UNEXPECTED_ERROR, true))
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
			reject(new ServerError(null, HttpStatusCodes.BAD_REQUEST, ErrorMessages.WRONG_ACTIVATION_CODE, false))
		}
	})
)