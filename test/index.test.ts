import unauhorized from './unauthorized.test'
import user from './user.test'
import manager from './manager.test'
import admin from './admin.test'

import { User } from '../src/models'

describe('sequentially run tests', () => {
	unauhorized()
	user()

	afterAll(() => {
		User.deleteOne({ phone_number: '905468133193' }).then((deletedUser) => {
			console.log('User deleted', deletedUser)
		})
	})
})