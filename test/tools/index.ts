import jwt from 'jsonwebtoken'

import { Admin } from '../../src/models'

export const isTextContainsAllKeys = (text: string, keys: string[]) => keys.every((key) => text.includes(key))

export const getTestAdminToken = () => (
	new Promise((resolve) => {
		Admin.findOne({ phoneNumber: '555 555 55 55' }).then((adminObj) => {
			jwt.sign({ payload: adminObj }, 'secret', (jwtErr: Error, createdToken: any) => {
				if (jwtErr) {
					console.log(jwtErr.message)
				}
				resolve(createdToken)
			})
		})
	})
)