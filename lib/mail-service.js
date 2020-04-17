const mailGenerate = require('./mail-generate')
const { MAIL } = require('../config/app')

function confirmAccountMail(email, host, token) {
    const mailOptions = {
        from: MAIL.from,
        to: email,
        subject: 'Account Verification Token',
        text: `Hello,\n\n
            Please verify your account by clicking the link: \n
            http://${host}/auth/confirm/${token}
            `,
    }

    const success = {
        statusCode: 200,
        message: `A verification email has been sent to ${email}.`,
    }
    return mailGenerate(mailOptions, success)
        .then((data) => data)
        .catch((err) => console.log(err))
}

function resetPasswordMail(email, host, token) {
    const mailOptions = {
        from: MAIL.from,
        to: email,
        subject: 'Reset Password',
        text: `Hi \n 
        http://${host}/auth/reset/${token} to reset your password. \n\n 
        If you did not request this, please ignore this email and your password will remain unchanged.\n
        `,
    }

    const success = {
        statusCode: 200,
        message: `A mail for reset password send ${email}.`,
    }

    return mailGenerate(mailOptions, success)
        .then((data) => data)
        .catch((err) => console.log(err))
}

function passwordHasBeChangedMail(email) {
    const mailOptions = {
        to: email,
        from: MAIL.from,
        subject: 'Your password has been changed',
        text: `Hi \n
            This is a confirmation that the password for your account ${email} has just been changed.\n`,
    }

    const success = {
        statusCode: 200,
        message: `A mail about changed password send ${email}.`,
    }

    return mailGenerate(mailOptions, success)
        .then((data) => data)
        .catch((err) => console.log(err))
}

module.exports = {
    confirmAccountMail,
    resetPasswordMail,
    passwordHasBeChangedMail,
}
