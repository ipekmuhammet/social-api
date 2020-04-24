import unauhorized from './unauthorized/index.test'
import user from './user/index.test'
// import manager from './manager.test'
// import admin from './admin.test'

import { User } from '../src/models'

describe('sequentially run tests', () => {
	unauhorized()
	user()

	afterAll(() => {
		User.deleteOne({ phoneNumber: '0555 555 55 55' }).then((deletedUser) => { // Phone number converted to regional
			console.log('User deleted', deletedUser)
		})
	})
})