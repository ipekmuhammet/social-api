/* eslint-disable no-param-reassign */
import Product from './Product'
import Category from './Category'

import atistirmalik from './jsons/src/atistirmalik-products.json'
import bebek from './jsons/src/bebek-products.json'
import gidadisi from './jsons/src/gida-disi-products.json'
import gida from './jsons/src/gida-products.json'
import icecek from './jsons/src/icecek-products.json'
import kahvaltilik from './jsons/src/kahvaltilik-products.json'
import kisisel from './jsons/src/kisisel-products.json'
import temizlik from './jsons/src/temizlik-products.json'
import Categories from './category-enum'

const saveProducts = (products: any, category: any) => {
	products.forEach((el: any) => {
		el.image = `${category}/${el.id}`
		el.category = category

		delete el.image_types
		delete el.images
		delete el.category_breadcrumb

		new Product(el).save()
	})
}

const saveCategories = () => {
	new Category({ name: 'Gıda', id: 0 }).save()
	new Category({ name: 'Gıda Dışı', id: 1 }).save()
	new Category({ name: 'Atıştırmalık', id: 2 }).save()
	new Category({ name: 'Bebek Ürünleri', id: 3 }).save()
	new Category({ name: 'İçecek', id: 4 }).save()
	new Category({ name: 'Kahvaltılık', id: 5 }).save()
	new Category({ name: 'Kişisel Bakım', id: 6 }).save()
	new Category({ name: 'Temizlik', id: 7 }).save()
}

export const load = () => {
	saveCategories()
	saveProducts(atistirmalik, Categories.SNACK)
	saveProducts(bebek, Categories.BABY)
	saveProducts(gidadisi, Categories.NON_FOOD)
	saveProducts(gida, Categories.FOOD)
	saveProducts(icecek, Categories.DRINK)
	saveProducts(kahvaltilik, Categories.BREAKFAST)
	saveProducts(kisisel, Categories.PERSONAL_CARE)
	saveProducts(temizlik, Categories.CLEANING)
}

export const test = () => {
	Product.findOne({ id: 38392 }).then((res) => {
		console.log('1', res)
	})

	Category.findOne({ id: 4 }).then((res) => {
		console.log('2', res)
	})
}