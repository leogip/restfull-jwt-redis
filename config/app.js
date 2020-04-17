const dotenv = require('dotenv')
const path = require('path')

const root = path.join.bind(this, __dirname, '../')
dotenv.config({ path: root('.env') })

const IS_PROD = process.env.NODE_ENV === 'production'
const IS_DEV = !IS_PROD
const PORT = process.env.PORT || 3000
const MONGO_URI = process.env.MONGO_URI

const JWT = {
    secret: process.env.JWT_SECRET,
    expiresIn: +process.env.SECOND_EXPIRES_IN_TOKEN,
}

const REDIS = {
    cron: process.env.CRON_REDIS,
}

const CLIENT = {
    url: process.env.CLIENT_URL,
}

const MAIL = {
    secret: process.env.MAIL_JWT_SECRET,
    expiresIn: process.env.MAIL_TOKEN_EXPIRES,
    service: process.env.MAIL_SERVICE,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    service: process.env.MAIL_SERVICE,
    user: process.env.MAIL_AUTH_USER,
    password: process.env.MAIL_AUTH_PASSWORD,
    from: process.env.MAIL_FROM,
}

if (!JWT.secret) {
    throw Error('You mast jwt secret string!')
}

module.exports = {
    PORT,
    MONGO_URI,
    JWT,
    REDIS,
    IS_PROD,
    IS_DEV,
    CLIENT,
    MAIL,
}
