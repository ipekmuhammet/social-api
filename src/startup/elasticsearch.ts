import { Client } from '@elastic/elasticsearch'

class ElasticSeach {
	private static client: Client

	/* eslint-disable no-useless-constructor */
	// eslint-disable-next-line no-empty-function
	private constructor() { }

	static connect(url: string) {
		this.client = new Client({ node: url })
	}

	static get getClient() {
		if (!this.client) {
			throw new Error('Elasticsearch not connected!')
		}
		return this.client
	}
}

export default ElasticSeach