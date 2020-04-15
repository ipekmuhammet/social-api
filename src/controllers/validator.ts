import JoiBase from '@hapi/joi'
// @ts-ignore
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

class Validator {
    static instance: Validator

    phoneSchema = Joi.object({
    	phone_number: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true })
    })

    // eslint-disable-next-line no-useless-constructor, no-empty-function
    private constructor() { }

    static get getInstance() {
    	if (!this.instance) {
    		this.instance = new Validator()
    	}
    	return this.instance
    }

    validatePhoneNumber(requestBody: any) {
    	return this.phoneSchema.validate(requestBody)
    }
}

export default Validator