const bcrypt = require('bcryptjs')
const { v4 } = require('uuid')
const sha256 = require('sha256')
const client = require('../../connectors/redis-client')
const { User, Token } = require('../../connectors/db')
const Response = require('../../middlewares/response')
const {
    confirmAccountMail,
    resetPasswordMail,
    passwordHasBeChangedMail,
} = require('../../lib/mail-service')
const { CLIENT } = require('../../config/app')

async function login(req, res) {
    const { email, password } = req.body
    if (!email || !password) {
        const fields = []
        if (!email) fields.push('email')
        if (!password) fields.push('password')

        res.statusCode = 400
        res.send(
            new Response('Required fields not present', res.statusCode, fields)
        )
        return
    }

    try {
        const data = await User.findOne({ email })

        if (!data) {
            res.statusCode = 404
            res.send(
                new Response(
                    'Email or password wrong',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }

        if (!bcrypt.compareSync(password, data.password)) {
            res.statusCode = 400
            res.send(
                new Response(
                    'Email or password wrong',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }

        const id = data._id.toString()
        const { token, jti, exp } = data.generateJWT()

        client.hmset(id, [jti, sha256(token), `exp-${jti}`, exp], (error) => {
            if (error) {
                res.statusCode = 500
                res.send(
                    new Response(
                        'Cannot set token in Redis ' + error,
                        res.statusCode,
                        error
                    )
                )
                return
            }
            res.send(new Response({ token }).getStructuredResponse())
        })
    } catch (error) {
        res.statusCode = 500
        res.send(
            new Response(
                'Authenticated fail ' + error,
                res.statusCode
            ).getStructuredResponse()
        )
        return
    }
}

async function confirmAccount(req, res) {
    const { token } = req.params
    try {
        const confirm = await Token.findOne({ token })

        if (!confirm) {
            res.statusCode = 400
            res.send(
                new Response(
                    'We were unable to find a valid token. Your token my have expired.',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }

        const user = await User.findOne({ _id: confirm._userId })

        if (!user) {
            res.statusCode = 400
            res.send(
                new Response(
                    'We were unable to find a user for this token..',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }

        if (user.isVerified) {
            await Token.findOneAndRemove({ token })
            res.statusCode = 400
            res.send(
                new Response(
                    'This user has already been verified.',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }

        user.isVerified = true
        await user.save()

        res.statusCode = 200
        res.send(
            new Response(
                'The account has been verified. Please log in',
                res.statusCode
            ).getStructuredResponse()
        )
        return
    } catch (error) {
        res.statusCode = 500
        res.send(
            new Response(
                'The account not verified  ' + error,
                res.statusCode
            ).getStructuredResponse()
        )
        return
    }
}

async function resendConfirmAccount(req, res) {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            res.statusCode = 400
            res.send(
                new Response(
                    'We were unable to find a user with that email.',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }

        if (user.isVerified) {
            res.statusCode = 400
            res.send(
                new Response(
                    'This account has already been verified. Please log in.',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }

        const confirmToken = await createConfirmToken(
            user._id,
            user.email,
            CLIENT.url
        )

        if (confirmToken.statusCode !== 200) {
            res.statusCode = 500
            res.send(
                new Response(
                    'Account not confirmed',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }

        res.statusCode = confirmToken.statusCode
        res.send(
            new Response(
                confirmToken.message,
                res.statusCode
            ).getStructuredResponse()
        )
    } catch (error) {
        res.statusCode = 400
        res.send(
            new Response(
                'Cannot Confirm account',
                res.statusCode,
                error
            ).getStructuredResponse()
        )
        return
    }
}

async function createConfirmToken(id, email, host) {
    const confirm = await Token.create({
        _userId: id,
        token: v4(),
    })

    return await confirmAccountMail(email, host, confirm.token)
}

async function recover(req, res) {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            res.statusCode = 400
            res.send(
                new Response(
                    'The email address ' +
                        email +
                        ' is not associated with any account. Double-check your email address and try again.',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }

        user.generatePasswordReset()

        await user.save()

        console.log(user)

        const sendEmail = await resetPasswordMail(
            user.email,
            CLIENT.url,
            user.resetPasswordToken
        )

        res.statusCode = sendEmail.statusCode
        res.send(
            new Response(
                sendEmail.message,
                res.statusCode
            ).getStructuredResponse()
        )
        return
    } catch (error) {
        res.statusCode = 500
        res.send(
            new Response(
                'Reset password fail',
                res.statusCode,
                error
            ).getStructuredResponse()
        )
        return
    }
}

async function reset(req, res) {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
        })

        if (!user) {
            res.statusCode = 400
            res.send(
                new Response(
                    'Password reset token is invalid or has expired.',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }

        res.statusCode = 200

        res.send(new Response(user, res.statusCode).getStructuredResponse())
    } catch (error) {
        res.statusCode = 500
        res.send(new Response(error, res.statusCode).getStructuredResponse())
    }
}

async function resetPassword(req, res) {
    if (!req.params.token) {
        res.statusCode = 404
        res.send(
            new Response(
                'Token not expierd',
                res.statusCode
            ).getStructuredResponse()
        )
        return
    }
    const { token } = req.params
    const { email, password } = req.body

    try {
        const user = await User.findOne({
            email,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        })

        if (!user) {
            res.statusCode = 400
            res.send(
                new Response(
                    'User not found',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }

        user.password = password
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined

        await user.save()

        const sendEmail = await passwordHasBeChangedMail(user.email)

        res.statusCode = sendEmail.statusCode
        res.send(
            new Response(
                sendEmail.message,
                res.statusCode
            ).getStructuredResponse()
        )
        return
    } catch (error) {
        res.statusCode = 500
        console.log(error)

        res.send(new Response(error, res.statusCode).getStructuredResponse())
        return
    }
}

function logout(req, res) {
    client.hdel(req.user.id, [req.user.jti, `exp-${req.user.jti}`], (err) => {
        if (err) {
            res.statusCode = 500
            res.send(
                new Response(
                    'Could not delete key',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }
        res.statusCode = 200
        res.send(
            new Response(
                'Successfully deleted the key',
                res.statusCode
            ).getStructuredResponse()
        )
    })
}

function verify(req, res) {
    res.statusCode = 200
    res.send(
        new Response('token is valid', res.statusCode).getStructuredResponse()
    )
}

module.exports = {
    login,
    confirmAccount,
    resendConfirmAccount,
    createConfirmToken,
    recover,
    reset,
    resetPassword,
    logout,
    verify,
}
