import { Redis } from '../startup'

// eslint-disable-next-line no-unused-vars
import Product, { ProductDocument } from '../models/Product'
// eslint-disable-next-line no-unused-vars
import Category, { CategoryDocument } from '../models/Category'
import { Manager } from '../models'

export const verifyManager = (managerId: string) => (
	Manager.findByIdAndUpdate(managerId, { verified: true })
)

export const saveCategoryToDatabase = (categoryContext: CategoryDocument) => (
	new Category(categoryContext).save()
)

export const updateCategory = (categoryId: string, categoryContext: CategoryDocument) => (
	Category.findByIdAndUpdate(categoryId, categoryContext)
)

export const saveCategoryToCache = (category: CategoryDocument | any) => (
	Category.find().then((categories) => (
		Redis.getInstance.setAsync('categories', JSON.stringify(categories)).then(() => category)
	))
)

export const saveProductToDatabase = (productContext: ProductDocument) => (
	new Product(productContext).save()
)

export const saveProductToCache = (product: ProductDocument | any) => (
	Redis.getInstance.setAsync(product.id, JSON.stringify(product)).then(() => product)// TODO product._id
)

export const updateProduct = (productId: string, productContext: ProductDocument) => (
	Product.findByIdAndUpdate(productId, productContext)
)