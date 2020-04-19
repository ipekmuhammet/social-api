import {
	Elasticsearch
} from '../startup'

import categories from './Categories.json'
import products from '../models/jsons/src/atistirmalik-products.json'

const index = 'doc'
const type = 'doc'

const deleteIndex = () => (
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	Elasticsearch.getClient.indices.exists({ index }).then((result) => {
		if (result.body) {
			Elasticsearch.getClient.indices.delete({ index })
		}
	})
)

const createIndex = () => (
	Elasticsearch.getClient.indices.create({
		index,
		body: {
			number_of_shards: 4,
			number_of_replicas: 3
		}
	})
)

const closeIndex = () => (
	Elasticsearch.getClient.indices.close({ index })
)

const openIndex = () => (
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	Elasticsearch.getClient.indices.open({ index })
)

const putSettings = () => (
	Elasticsearch.getClient.indices.putSettings({
		index,
		// type,
		body: {
			settings: {
				analysis: {
					analyzer: {
						my_analyzer: {
							tokenizer: 'my_tokenizer'
						}
					},
					tokenizer: {
						my_tokenizer: {
							type: 'ngram',
							min_gram: 2,
							max_gram: 3,
							token_chars: [
								'letter',
								'digit'
							]
						}
					}
				}
			}
		}
	})
)

const putMapping = () => (
	Elasticsearch.getClient.indices.putMapping({
		index,
		type,
		body: {
			doc: {
				properties: {
					// geometry: {
					// 	properties: {
					// 		location: {
					// 			type: 'geo_point'
					// 		}
					// 	}
					// },
					product_name: {
						type: 'text'
					}
				}
			}
		}
	})
)

const saveCategories = () => (
	Elasticsearch.getClient.bulk({
		index,
		type,
		// refresh: true,
		body: categories.reduce((previousValue, currentValue) => previousValue.concat({
			index: {
				_index: index,
				_id: currentValue.id
			}
		}, currentValue), [])
	})
)

const saveProducts = () => (
	Elasticsearch.getClient.bulk({
		index,
		type,
		// refresh: true,
		body: products.reduce((previousValue, currentValue) => previousValue.concat({
			index: {
				_index: index,
				_id: currentValue.id
			}
		}, currentValue), [])
	})
)

const main = () => {
	deleteIndex()
		.then(createIndex)
		.then(closeIndex)
		.then(putSettings)
		.then(putMapping)
		.then(openIndex)
		// .then(saveCategories)
		.then(saveProducts)
		.catch((reason) => {
			console.log(reason.meta.body.error)
		})
}

export default main