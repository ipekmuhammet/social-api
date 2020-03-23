import { Redis } from '../startup'
import categories from './Categories.json'
import products from './Products.json'

const main = () => {
	const x = Redis.getInstance.multi()

	x.setAsync('categories', JSON.stringify(categories))

	categories.map((category: any) => {
		x.hset('productsx', category.Id, JSON.stringify({ [category.Id]: products.filter((product: any) => product.categoryId === category.Id) }))
	})

	x.exec((err) => {
		if (err) {
			console.log('err', err)
		}
	})
}

export default main