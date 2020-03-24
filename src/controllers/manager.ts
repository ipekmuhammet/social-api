import { Router } from 'express'

import { Redis } from '../startup'

const router = Router()

router.get('/orders', (req, res) => {
	Redis.getInstance.lrange('manager1', 0, -1, (err, values) => {
		res.json(values.map((val) => JSON.parse(val)))
	})
})

router.get('/orders/:id', (req, res) => {
	res.json({
		id: 1,
		customer: 'Muhammet İpek',
		address: 'Ayvasaray Mah. Ahmet Rufai sok. No : 6/1',
		date: new Date().toLocaleString(),
		// starts : 2.2 // Müşteri daha önce memnuniyetsizliğini belirttiyse bi güzellik yapılabilir. :)
		// price: (23.43 * 5) + (76.36 * 2), // Online ödemelerde manager'ın ücret ile işi yok.
		products: [
			{
				Id: '1',
				name: 'Alcoholic beverages',
				price: '23.43',
				categoryId: 0,
				count: 5
			},
			{
				Id: '12',
				name: 'Danone Pro+ Muz & Yer Fıstıklı Proteinli Süt 330 Ml',
				price: '76.36',
				categoryId: 1,
				count: 2
			}
		]
	})
})

export default router