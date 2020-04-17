const nodemailer = require('nodemailer')
const { MAIL } = require('../config/app')

module.exports = function generateMail(options, success) {
    const transporter = nodemailer.createTransport({
        host: MAIL.host,
        port: MAIL.port,
        secure: MAIL.secure,
        auth: {
            user: MAIL.user,
            pass: MAIL.password,
        },
    })

    return new Promise((resolve, reject) => {
        transporter.sendMail(options, (error) => {
            reject({ statusCode: 500, message: error })
        })
        resolve(success)
    })
}
