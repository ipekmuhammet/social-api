import getManagerRequestsTests from './get-manager-requests.test'
import postCategoryTests from './post-category.test'
import putCategoryByIdTests from './put-category-by-id.test'
import postProductTests from './post-product.test'
import putProductByIdTests from './put-product-by-id.test'
import putVerifyManagerTests from './put-verify-manager.test'
import deleteCategoryByIdTests from './delete-category-by-id.test'
import deleteProductByIdTests from './delete-product-by-id.test'

export default () => describe('admin', () => {
	getManagerRequestsTests()
	postCategoryTests()
	putCategoryByIdTests()
	deleteCategoryByIdTests()
	postProductTests()
	putProductByIdTests()
	deleteProductByIdTests()
	putVerifyManagerTests()
})