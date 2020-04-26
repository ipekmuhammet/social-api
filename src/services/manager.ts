
import { Redis } from '../startup'

export const getOrderById = (orderId: string) => (
	Redis.getInstance.hgetAsync('orders', orderId)
)

export const updateOrderStatus = (order: any, orderId: string, status: boolean) => (
	Redis.getInstance.hsetAsync('orders', orderId, JSON.stringify({ ...JSON.parse(order), ...{ status } })).then(() => (
		{ ...JSON.parse(order), ...{ status: true } }
	))
)