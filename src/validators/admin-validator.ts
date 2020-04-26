// eslint-disable-next-line no-unused-vars
import { ProductDocument } from '../models/Product'
// eslint-disable-next-line no-unused-vars
import { CategoryDocument } from '../models/Category'
import {
	saveProductSchema,
	updateProductSchema,
	categorySchema
} from '../schemas/admin-schema'

export const validatePostCategory = (category: CategoryDocument) => (
	categorySchema.validateAsync(category)
)

export const validateUpdateCategory = (category: CategoryDocument) => (
	categorySchema.validateAsync(category)
)

export const validatePostProduct = (product: ProductDocument) => (
	saveProductSchema.validateAsync(product)
)

export const validateUpdateProduct = (product: ProductDocument) => (
	updateProductSchema.validateAsync(product)
)