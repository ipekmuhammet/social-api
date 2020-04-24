import postOrderTests from './post-order.test'
import postCartTests from './post-cart.test'
import getCartTests from './get-cart.test'
import postAddressTests from './post-address.test'
import deleteAddressTests from './delete-address.test'

export default () => describe('user', () => {
	postAddressTests()
	postOrderTests()
	postCartTests()
	getCartTests()
	deleteAddressTests()
})