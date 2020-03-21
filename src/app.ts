import express from 'express'

import middlewares from './startup/middlewares'

const app = express()
middlewares(app)

app.get('/', (req, res) => {
	console.log(req.body)
	res.end('sa')
})

export default app