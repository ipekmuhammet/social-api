import { Router } from 'express'

import { Redis } from '../startup'
import { User } from '../models'
import { validateAuthority } from './auth-middleware'
import Authority from './authority-enum'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.put('/add-address', (req, res) => {
	// @ts-ignore
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
	// @ts-ignore
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
		customer: req.body.customer,
		address: req.body.address,
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