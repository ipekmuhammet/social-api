import Joi from '@hapi/joi'

import {
	updateProfileSchema,
	saveCartSchema,
	productSchema,
	saveAddressSchema,
	changePasswordSchema,
	phoneSchema
} from '../schemas/user-schema'

export const validatePhoneNumber = (requestBody: any) => (
	phoneSchema.validate(requestBody)
)

export const validateProducts = (products: any[]) => (
	Joi.array().items(productSchema).sparse(true).validate(products)
)

export const validateUpdateProfileRequest = (context: any) => (
	updateProfileSchema.validateAsync(context)
)

export const validateSaveCartRequest = (context: any) => (
	saveCartSchema.validateAsync(context)
)

export const validateSaveAddressRequest = (context: any) => (
	saveAddressSchema.validateAsync(context)
)

export const validateChangePasswordRequest = (context: any) => (
	changePasswordSchema.validateAsync(context)
)