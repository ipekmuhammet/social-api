import { Router } from 'express'

import { Redis, Elasticsearch } from '../startup'
import { User } from '../models'
import { validateAuthority } from './auth-middleware'
import Authority from './authority-enum'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.get('/categories', (req, res) => {
	Redis.getInstance.getAsync('categories').then((val: any) => {
		res.json(JSON.parse(val))
	})
})

router.get('/products', (req, res) => {
	Redis.getInstance.hgetall('productsx', (err: any, obj: any) => {
		if (err) {
			console.log(err)
			throw new Error('err /products')
		} else {
			res.json(Object.values(obj).reduce((previousValue, currentValue: any) => Object.assign(previousValue, JSON.parse(currentValue)), {}))
		}
	})
})

router.get('/productsByCategoryId', (req, res) => {
	Redis.getInstance.hget('productsx', req.body.categoryId, (err: any, obj: any) => {
		res.json(JSON.parse(obj))
	})
})

router.get('/productById', (req, res) => {
	Redis.getInstance.getAsync(req.query.id).then((obj: any) => {
		res.json(JSON.parse(obj))
	})
})

router.get('/searchProduct', (req, res) => {
	Elasticsearch.getClient.search({
		index: 'doc',
		type: 'doc',
		body: {
			query: {
				bool: {
					must: [
						// {
						// 	geo_distance: {
						// 		distance: '1km',
						// 		'geometry.location': location
						// 	}
						// },
						{
							match_phrase_prefix: {
								name: 'po'
							}
						}
					]
				}
			}
		}
	}).then((vals: any) => {
		res.json(vals.body.hits.hits)
	})
})

router.put('/add-address', (req, res) => {
	User.findById(req.userId).then((user: any) => {
		if (user) {
			user.addresses.push(req.body)
			user.save().then((result: any) => {
				res.json(result)
			})
		} else {
			res.status(401).json({ status: false, error: 'User does not exists on Database, but in cache.' })
		}
	}).catch((reason) => {
		console.log(reason)
		res.status(401).json({ status: false, error: 'Database error.' })
	})
})

router.put('/delete-address', (req, res) => {
	User.findById(req.userId).then((user: any) => {
		if (user) {
			// eslint-disable-next-line no-underscore-dangle
			user.addresses.splice(user.addresses.indexOf(user.addresses.find((address: any) => address._id.toString() === req.body._id)), 1)
			user.save().then((result: any) => {
				res.json(result)
			})
		} else {
			res.status(401).json({ status: false, error: 'User does not exists on Database, but in cache.' })
		}
	}).catch((reason) => {
		console.log(reason)
		res.status(401).json({ status: false, error: 'Database error.' })
	})
})

router.post('/makeOrder', (req, res) => {
	const id = Math.random().toString()
	const val = {
		id,
		customer: 'Muhammet İpek',
		address: 'Ayvasaray Mah. Ahmet Rufai sok. No : 6/1',
		date: new Date().toLocaleString(),
		// starts : 2.2 // Müşteri daha önce memnuniyetsizliğini belirttiyse bi güzellik yapılabilir. :)
		// price: (23.43 * 5) + (76.36 * 2), // Online ödemelerde manager'ın ücret ile işi yok.
		products: Object.values(req.body.cart)
	}

	Redis.getInstance.hset('category1', id, JSON.stringify(val), (err) => {
		if (!err) {
			res.json({ status: true })
		} else {
			res.json({ status: false })
		}
	})

	//	Redis.getInstance.rpush('manager1', JSON.stringify(val), (err) => {
	//		if (!err) {
	//			res.json({ status: true })
	//		} else {
	//			res.json({ status: false })
	//		}
	//	})

	// Redis.getInstance.rpop('manager1') // delete last item

	// Redis.getInstance.lrem('manager1', 0, 'product1', (err, reply) => { // delete all items with value product1 of key manager1
	// 	if (err) console.log('err')
	// 	console.log(reply)
	// })

	// Redis.getInstance.lrange('manager1', 0, -1, (err, reply) => {
	// 	res.json(reply)
	// })
})

export default router