import { Router } from 'express'
import { Redis, Elasticsearch } from '../startup'

const router = Router()

router.get('/categories', (req, res) => {
	Redis.getInstance.getAsync('categories').then((val: any) => {
		res.json(JSON.parse(val))
	})
})

router.get('/products', (req, res) => {
	Redis.getInstance.hgetall('productsx', (err: any, obj: any) => {
		res.json(Object.values(obj).reduce((previousValue, currentValue: any) => Object.assign(previousValue, JSON.parse(currentValue)), {}))
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

router.post('/makeOrder', (req, res) => {
	const id = Math.random().toString()
	const val = {
		id,
		customer: 'Muhammet İpek',
		address: 'Ayvasaray Mah. Ahmet Rufai sok. No : 6/1',
		date: new Date().toLocaleString(),
		// starts : 2.2 // Müşteri daha önce memnuniyetsizliğini belirttiyse bi güzellik yapılabilir. :)
		// price: (23.43 * 5) + (76.36 * 2), // Online ödemelerde manager'ın ücret ile işi yok.
		products: [
			{
				Id: '1',
				name: 'x',
				price: '23.50',
				categoryId: 0,
				count: 5
			},
			{
				Id: '12',
				name: 'y',
				price: '76.36',
				categoryId: 1,
				count: 2
			}
		]
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