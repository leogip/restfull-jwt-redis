const express = require('express')
const cors = require('cors')
const logger = require('morgan')

require('./cron/redis-cron')

const app = express()

app.use(express.static(__dirname + '/public'))
app.use(logger('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

app.use('/api/user', require('./modules/user/user.controller'))
app.use('/api/auth', require('./modules/auth/auth.controller'))

module.exports = app
