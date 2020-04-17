#!/usr/bin/env node

const http = require('http')
const { connect } = require('../connectors/db')
const { PORT } = require('../config/app')
const app = require('../app')

/**
 * Create HTTP server.
 */

const server = http.createServer(app)

/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error) => {
    if (error.syscall !== 'listen') {
        throw error
    }

    const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`)
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`)
            process.exit(1)
            break
        default:
            throw error
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = () => {
    const addr = server.address()
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
    console.log(`Server has been started on ${bind}`)
}

/**
 * Listen on provided port, on all network interfaces. Connect to db
 */

server.on('error', onError)
server.on('listening', onListening)

connect()
    .then((info) => {
        console.log(`Connected to ${info.host}: ${info.port}/${info.name}`)
        server.listen(PORT)
    })
    .catch(() => console.log('Unable to connection to database'))
