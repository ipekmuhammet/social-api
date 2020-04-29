import postOrderTests from './post-order.test'
import postCartTests from './post-cart.test'
import getCartTests from './get-cart.test'
import postAddressTests from './post-address.test'
import deleteAddressTests from './delete-address.test'
import postPaymentCardTests from './post-payment-card.test'
import getListCardsTests from './get-list-cards.test'

export default () => describe('user', () => {
	postAddressTests()
	postPaymentCardTests()
	// getListCardsTests()
	postOrderTests()
	postCartTests()
	getCartTests()
	deleteAddressTests()
})