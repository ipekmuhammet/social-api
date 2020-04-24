import unauhorized from './unauthorized/index.test'
import user from './user/index.test'
// import manager from './manager.test'
// import admin from './admin.test'

import { User } from '../src/models'

describe('sequentially run tests', () => {
	unauhorized()
	user()

	afterAll(() => {
		User.deleteOne({ phone_number: '905555555555' }).then((deletedUser) => {
			console.log('User deleted', deletedUser)
		})
	})
})