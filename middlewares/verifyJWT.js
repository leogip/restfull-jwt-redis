const JWT = require('jsonwebtoken')
const jwtDecode = require('jwt-decode')
const sha256 = require('sha256')
const client = require('../connectors/redis-client')
const Response = require('./response')
const { secret } = require('../config/app').JWT

const verifyJWT = (role) => (req, res, next) => {
    if (!('authorization' in req.headers)) {
        res.statusCode = 401
        res.send(
            new Response(
                'No token found in the headers',
                res.statusCode
            ).getStructuredResponse()
        )
        return
    }

    const token = req.headers.authorization.split('Bearer ')[1]

    try {
        JWT.verify(token, secret)
    } catch (error) {
        res.statusCode = 401
        res.send(
            new Response(
                'Invalid token',
                res.statusCode,
                error
            ).getStructuredResponse()
        )
        return
    }

    req.user = jwtDecode(token)

    if (!role.includes(req.user.role)) {
        res.statusCode = 401
        res.send(
            new Response(
                `Your role '${req.user.role}' not authorized to perform this action`,
                res.statusCode
            ).getStructuredResponse()
        )
        return
    }

    client.hgetall(req.user.id, (err, response) => {
        if (err) {
            res.statusCode = 500
            res.send(
                new Response(
                    'Could not fetch data from Redis',
                    res.statusCode,
                    err
                ).getStructuredResponse()
            )
            return
        }
        if (!response || response[req.user.jti] !== sha256(token)) {
            res.statusCode = 401
            res.send(
                new Response(
                    'Token not found in Redis',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }
        next()
    })
}

module.exports = verifyJWT
