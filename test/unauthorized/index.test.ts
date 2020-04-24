import request from 'supertest'

import app from '../../src/app'
import ActivationCodes from '../../src/enums/activation-code-enum'

import postSendActivationCodeTests from './post-send-activation-code.test'
import postRegisterTests from './post-register.test'
import postLoginTests from './post-login.test'
import putResetPasswordTests from './put-reset-password.test'

import getProductsTests from './get-products.test'
import getCategoriesTests from './get-categories.test'
import getProductByIdTests from './get-product-by-id.test'

export default () => describe('Unauthorized', () => {
	postSendActivationCodeTests()
	postRegisterTests()
	postLoginTests()
	describe('divider', () => {
		it('Send code activation code for reset password', () => (
			request(app)
				.post('/send-activation-code')
				.send({
					phone_number: '905555555555',
					activationCodeType: ActivationCodes.RESET_PASSWORD
				})
				.expect(202)
		))
	})
	putResetPasswordTests()
	getProductsTests()
	getCategoriesTests()
	getProductByIdTests()
})