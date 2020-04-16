import JoiBase from '@hapi/joi'
// @ts-ignore
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

class Validator {
	static instance: Validator

	phoneSchema = Joi.object({
		phone_number: Joi.string().phoneNumber({ defaultCountry: 'TR', strict: true })
	})

	productSchema = Joi.object({
		brand: Joi.string().required(),
		id: [
			Joi.string().required(),
			Joi.number().required(),
		],
		kind_name: Joi.string().allow(null, ''),
		product_name: Joi.string().required(),
		old_price: Joi.number().allow(null, ''),
		price: Joi.number().required(),
		title: Joi.string().required(),
		category_breadcrumb: Joi.string().allow(null, ''),
		images: Joi.array().items(Joi.string()).required(),
		// images: Joi.array().items(Joi.string().required()).required(),
		image_types: Joi.object().required(),
		units: Joi.string().allow(null, ''),
		quantity: Joi.number().min(1).required()
	}).unknown()

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

	validateProducts(products: any[]) {
		return Joi.array().items(this.productSchema).validate(products)
	}
}

export default Validator