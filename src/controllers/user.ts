import { Router } from 'express'
import { Redis, Elasticsearch } from '../startup'

const router = Router()

router.get('/categories', (req, res) => {
	Redis.getInstance.getAsync('categories').then((val: any) => {
		res.json(JSON.parse(val))
	})
})

router.get('/products', (req, res) => {
	Redis.getInstance.hvals('productsx', (err: any, obj: any) => {
		res.json(obj)
	})
})

router.get('/productsByCategoryId', (req, res) => {
	Redis.getInstance.hget('productsx', req.body.categoryId, (err: any, obj: any) => {
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
								// name
								name: 'pou'
							}
						}
					]
				}
			}
		}
	}).then((vals: any) => {
		console.log(vals.body.hits.hits)
	})


	res.end('sa')
})

export default router