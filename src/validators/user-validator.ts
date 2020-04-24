import Joi from '@hapi/joi'

import {
	updateProfileSchema,
	productSchema,
	saveAddressSchema,
	changePasswordSchema,
	phoneSchema,
	makeOrderSchema
} from '../schemas/user-schema'

// eslint-disable-next-line no-unused-vars
import { ProductDocument } from '../models/Product'

export const validatePhoneNumber = (requestBody: any) => (
	phoneSchema.validate(requestBody)
)

export const validateProducts = (products: ProductDocument[]) => (
	Joi.array().items(productSchema).sparse(true).validateAsync(products)
)

export const validateUpdateProfileRequest = (context: any) => (
	updateProfileSchema.validateAsync(context)
)

export const validateSaveCartRequest = (cart: any) => (
	validateProducts(Object.values(cart))
)

export const validateSaveAddressRequest = (context: any) => (
	saveAddressSchema.validateAsync(context)
)

export const validateChangePasswordRequest = (context: any) => (
	changePasswordSchema.validateAsync(context)
)

export const validateMakeOrderRequest = (context: any) => (
	makeOrderSchema.validateAsync(context)
)