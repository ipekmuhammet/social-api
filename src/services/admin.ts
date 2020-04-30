import { Redis } from '../startup'

// eslint-disable-next-line no-unused-vars
import {
	Product,
	Category,
	Manager,
	// eslint-disable-next-line no-unused-vars
	ProductDocument,
	// eslint-disable-next-line no-unused-vars
	CategoryDocument
} from '../models'

export const verifyManager = (managerId: string) => (
	Manager.findByIdAndUpdate(managerId, { verified: true }, { new: true })
)

export const saveCategoryToDatabase = (categoryContext: CategoryDocument) => (
	new Category(categoryContext).save()
)

export const updateCategory = (categoryId: string, categoryContext: CategoryDocument) => (
	Category.findByIdAndUpdate(categoryId, categoryContext)
)

export const saveCategoryToCache = () => (
	Category.find().then((categories) => (
		Redis.getInstance.setAsync('categories', JSON.stringify(categories))
	))
)

export const saveProductToDatabase = (productContext: ProductDocument) => (
	new Product(productContext).save()
)

export const saveProductToCache = (product: ProductDocument | any) => (
	Redis.getInstance.setAsync(product._id.toString(), JSON.stringify(product)).then(() => product)
)

export const updateProduct = (productId: string, productContext: ProductDocument) => (
	Product.findByIdAndUpdate(productId, productContext, { new: true })
)