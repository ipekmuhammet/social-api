import postCategoryTests from './post-category.test'
import putCategoryByIdTests from './put-category-by-id.test'
import postProductTests from './post-product.test'
import putProductByIdTests from './put-product-by-id.test'
import putVerifyManagerTests from './put-verify-manager.test'

export default () => describe('admin', () => {
	postCategoryTests()
	putCategoryByIdTests()
	postProductTests()
	putProductByIdTests()
	putVerifyManagerTests()
})