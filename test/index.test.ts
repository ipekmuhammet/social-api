import unauhorized from './unauthorized/index.test'
import user from './user/index.test'
import manager from './manager/index.test'
import admin from './admin/index.test'

import {
	User,
	Manager,
	Admin,
	Category
} from '../src/models'

describe('sequentially run tests', () => {
	beforeAll((done) => {
		new Admin({
			phoneNumber: '555 555 55 55',
			nameSurname: 'test admin',
			email: 'test@test.com',
			password: '1234'
		}).save().then(() => {
			done()
		})
	})

	unauhorized()
	user()
	admin()
	// manager()

	afterAll(() => {
		User.deleteOne({ phoneNumber: '0555 555 55 55' }).then((deletedUser) => { // Phone number converted to regional
			console.log('User deleted', deletedUser)
		})

		Manager.deleteOne({ phoneNumber: '0555 555 55 55' }).then((deletedManager) => { // Phone number converted to regional
			console.log('Manager deleted', deletedManager)
		})

		Admin.deleteOne({ phoneNumber: '555 555 55 55' }).then((deletedAdmin) => {
			console.log('Admin deleted', deletedAdmin)
		})

		Category.deleteOne({ name: 'testCategory' }).then((deletedCategory) => {
			console.log('category deleted', deletedCategory)
		})
	})
})