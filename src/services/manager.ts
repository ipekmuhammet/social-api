import { Redis } from '../startup'
import { Order } from '../models'
// eslint-disable-next-line no-unused-vars
import { OrderDocument } from '../models/Order'

export const getOrderById = (orderId: string) => (
	Redis.getInstance.hgetAsync('orders', orderId)
)

export const updateOrderStatus = (orderId: string, status: boolean) => (
	Order.findByIdAndUpdate(orderId, { status })
)

export const saveOrderToCache = (order: OrderDocument) => (
	Redis.getInstance.hsetAsync('orders', order._id, JSON.stringify(order))
)