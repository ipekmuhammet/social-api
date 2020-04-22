import { Redis } from '../startup'
import { Product, Category } from '../models'

const main = () => {
	const multi = Redis.getInstance.multi()

	Category.find().then((categories) => {
		multi.setAsync('categories', JSON.stringify(categories))

		// console.log('---------------')
		// multi.del('products', (x, y) => {
		// 	console.log(x, y)
		// })

		categories.map((category: any) => {
			Product.find().then((products) => {
				products.map((product) => {
					multi.setAsync(product.id, JSON.stringify(product))
				})

				multi.hset('products', category.id, JSON.stringify({ [category.id]: products.filter((product: any) => product.category === category.id) }))
			})
		})
	})

	setTimeout(() => {
		multi.exec((err) => {
			if (err) {
				console.log('err', err)
			}
		})
	}, 1000 * 10)
}

export default main