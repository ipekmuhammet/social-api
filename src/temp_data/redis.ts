import { Redis } from '../startup'
import { Product, Category } from '../models'
// eslint-disable-next-line no-unused-vars
import { CategoryDocument } from '../models/Category'
// eslint-disable-next-line no-unused-vars
import { ProductDocument } from '../models/Product'

const main = () => {
	Redis.getInstance.del('categories')
	Redis.getInstance.del('products')

	const multi = Redis.getInstance.multi()

	Category.find().then((categories) => {
		multi.setAsync('categories', JSON.stringify(categories))

		// console.log('---------------')
		// multi.del('products', (x, y) => {
		// 	console.log(x, y)
		// })

		categories.map((category: CategoryDocument) => {
			Product.find().then((products) => {
				products.map((product) => {
					multi.setAsync(product._id.toString(), JSON.stringify(product))
				})

				multi.hset('products', category._id.toString(), JSON.stringify({ [category._id.toString()]: products.filter((product: ProductDocument) => product.category === category.imagePath) }))
			}).catch((err) => {
				console.log(err)
			})
		})
	})

	setTimeout(() => {
		multi.exec((err) => {
			if (err) {
				console.log('err', err)
			} else {
				console.log('done')
			}
		})
	}, 1000 * 10)
}

export default main