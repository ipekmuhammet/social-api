import getOrdersTests from './get-orders.test'
import getOrderByIdTests from './get-order-by-id.test'
import putOrdersCancelByIdTests from './put-orders-cancel-by-id.test'
import putOrdersConfirmByIdTests from './put-orders-confirm-by-id.test'

export default () => describe('manager', () => {
	getOrdersTests()
	getOrderByIdTests()
	// putOrdersCancelByIdTests()
	// putOrdersConfirmByIdTests()
})