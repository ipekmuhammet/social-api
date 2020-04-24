import bcrypt from 'bcrypt'
import HttpStatusCodes from 'http-status-codes'

import { Redis } from '../startup'
import { User, Manager } from '../models'
import ServerError from '../errors/ServerError'
import ErrorMessages from '../errors/ErrorMessages'
// eslint-disable-next-line no-unused-vars
import ActivationCodes from '../enums/activation-code-enum'

export const comparePasswords = (oldPassword: string, newPassword: string, errorMessage: string) => (
	bcrypt.compare(newPassword, oldPassword).then((validPassword) => {
		if (!validPassword) {
			throw new Error(errorMessage)
		}
	})
)

/** If User exists, throws Error. */
export const isManagerNonExists = (phoneNumber: string) => (
	Manager.findOne({ phoneNumber }).then((foundManager) => {
		if (foundManager) {
			throw new ServerError(ErrorMessages.MANAGER_ALREADY_EXISTS, HttpStatusCodes.BAD_REQUEST, ErrorMessages.MANAGER_ALREADY_EXISTS, false)
		}
	})
)

/** If User not exists, throws Error. */
export const isManagerExists = (phoneNumber: string) => (
	Manager.findOne({ phoneNumber }).then((foundManager) => {
		if (!foundManager) {
			throw new ServerError(ErrorMessages.MANAGER_IS_NOT_EXISTS, HttpStatusCodes.UNAUTHORIZED, ErrorMessages.MANAGER_IS_NOT_EXISTS, false)
		} else {
			return foundManager
		}
	})
)

/** If User exists, throws Error. */
export const isUserNonExists = (phoneNumber: string) => (
	User.findOne({ phoneNumber }).then((foundUser) => {
		if (foundUser) {
			throw new ServerError(ErrorMessages.USER_ALREADY_EXISTS, HttpStatusCodes.BAD_REQUEST, null, false)
		}
	})
)

/** If User exists, returns It else throws Error. */
export const isUserExists = (phoneNumber: string) => (
	User.findOne({ phoneNumber }).then((foundUser) => {
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
		Redis.getInstance.getAsync(`${phoneNumber}:activationCode:${activationCodeType}`).then((activationCode) => {
			if (!activationCode) {
				reject(new ServerError('Aktivasyon kodu bulunamadı!', HttpStatusCodes.INTERNAL_SERVER_ERROR, 'Aktivasyon kodu bulunamadı!', false))
			} else {
				resolve(activationCode)
			}
		}).catch((reason) => {
			reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, reason?.message, true))
		})
	})
)

/** Tests equality of activationCode from request and from Redis */
export const compareActivationCode = (activationCodeFromRequest: string, correctActivationCode: string) => (
	new Promise((resolve, reject) => {
		if (activationCodeFromRequest === correctActivationCode) {
			resolve()
		} else {
			reject(new ServerError(ErrorMessages.WRONG_ACTIVATION_CODE, HttpStatusCodes.BAD_REQUEST, ErrorMessages.WRONG_ACTIVATION_CODE, false))
		}
	})
)