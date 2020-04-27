import fs from 'fs'
import path from 'path'

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
import Categories from '../enums/category-enum'

import { Mongo } from '../startup'

const saveProducts = async (products: any, category: any) => {
	// eslint-disable-next-line guard-for-in, no-restricted-syntax
	for (const el of products) {
		// el.image = `${category}/${el.id}`
		el.category = category

		// eslint-disable-next-line no-await-in-loop
		await new Product(el).save()
		//	.then((x) => {
		//		// eslint-disable-next-line security/detect-non-literal-fs-filename
		//		try {
		//			fs.renameSync(
		//				path.join(__dirname, `../../public/assets/products/${category}/${el.id}.png`),
		//				// @ts-ignore
		//				path.join(__dirname, `../../public/assets/products/${category}/${x.image}.png`)
		//			)
		//		} catch (error) { }
		//	})
	}
}

const saveCategories = async () => {
	await new Category({ name: 'Gıda' }).save()
	await new Category({ name: 'Gıda Dışı' }).save()
	await new Category({ name: 'Atıştırmalık' }).save()
	await new Category({ name: 'Bebek Ürünleri' }).save()
	await new Category({ name: 'İçecek' }).save()
	await new Category({ name: 'Kahvaltılık' }).save()
	await new Category({ name: 'Kişisel Bakım' }).save()
	await new Category({ name: 'Temizlik' }).save()
}

export const load = async () => {
	Mongo.connect('mongodb://127.0.0.1:27017')
	await saveCategories()
	await saveProducts(atistirmalik, Categories.SNACK)
	await saveProducts(bebek, Categories.BABY)
	await saveProducts(gidadisi, Categories.NON_FOOD)
	await saveProducts(gida, Categories.FOOD)
	await saveProducts(icecek, Categories.DRINK)
	await saveProducts(kahvaltilik, Categories.BREAKFAST)
	await saveProducts(kisisel, Categories.PERSONAL_CARE)
	await saveProducts(temizlik, Categories.CLEANING)
	console.log('done')
}

export const test = () => {
	Product.findOne({ id: 38392 }).then((res) => {
		console.log('1', res)
	})

	Category.findOne({ id: 4 }).then((res) => {
		console.log('2', res)
	})
}

load()