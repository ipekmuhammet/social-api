import { Redis } from '../startup'
import categories from './Categories.json'
import products from './Products.json'

const main = () => {
	const multi = Redis.getInstance.multi()

	multi.setAsync('categories', JSON.stringify(categories))

	categories.map((category: any) => {
		multi.hset('productsx', category.Id, JSON.stringify({ [category.Id]: products.filter((product: any) => product.categoryId === category.Id) }))
	})

	products.map((product) => {
		multi.setAsync(product.Id, JSON.stringify(product))
	})

	multi.exec((err) => {
		if (err) {
			console.log('err', err)
		}
	})
}

export default main