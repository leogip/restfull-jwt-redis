const bcrypt = require('bcryptjs')
const Response = require('../../middlewares/response')
const { User } = require('../../connectors/db')
const { createConfirmToken } = require('../auth/auth.service')
const { CLIENT } = require('../../config/app')

async function index(req, res) {
    try {
        const users = await User.find({}).select(
            '-password -firstname -lastname -updatedAt'
        )
        if (!users) {
            res.statusCode = 404
            res.send(
                new Response(
                    'Users not found',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }
        res.statusCode = 200
        res.send(new Response(users, res.statusCode).getStructuredResponse())
    } catch (error) {
        res.statusCode = 500
        res.send(new Response(error, res.statusCode).getStructuredResponse())
    }
}

async function current(req, res) {
    try {
        const { id } = req.user

        const user = await User.findById({ _id: id }).select(
            '-password -firstname -lastname -updatedAt'
        )
        if (!user) {
            res.statusCode = 404
            res.send(
                new Response(
                    res.statusCode,
                    'Cannot get current user, you can repeat authentication'
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

async function byId(req, res) {
    try {
        const { id } = req.params
        const user = await User.findById({ _id: id }).select(
            '-password -firstname -lastname -updatedAt'
        )
        if (!user) {
            res.statusCode = 404
            res.send(
                new Response(
                    'Cannot get user',
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

async function create(req, res) {
    try {
        const { email, firstname, lastname, password } = req.body

        if (!email || !firstname || !lastname || !password) {
            const fields = []
            if (!email) fields.push('email')
            if (!firstname) fields.push('firstname')
            if (!lastname) fields.push('lastname')
            if (!password) fields.push('password')

            res.statusCode = 400
            res.send(
                new Response(
                    'Required fields not present',
                    res.statusCode,
                    fields
                ).getStructuredResponse()
            )
            return
        }

        const data = {
            email,
            password,
            firstname,
            lastname,
        }
        if (await User.findOne({ email })) {
            res.statusCode = 400
            res.send(
                new Response(
                    `Email ${email} is already taken`,
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }

        const user = await User.create(data)

        if (!user) {
            res.statusCode = 409
            res.send(
                new Response(
                    'Account not created',
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
        res.statusCode = 500
        res.send(
            new Response(
                'Cannot Create User ' + error,
                res.statusCode
            ).getStructuredResponse()
        )
    }
}

async function update(req, res) {
    try {
        const { id } = req.params
        const { email, firstname, lastname, password } = req.body

        if (!email || !firstname || !lastname || !password) {
            const fields = []
            if (!email) fields.push('email')
            if (!firstname) fields.push('firstname')
            if (!lastname) fields.push('lastname')
            if (!password) fields.push('password')

            res.statusCode = 400
            res.send(
                new Response(
                    'Required fields not present',
                    res.statusCode,
                    fields
                ).getStructuredResponse()
            )
            return
        }

        const user = await User.findOneAndUpdate(
            { _id: id },
            { email, firstname, lastname, password: bcrypt.hashSync(password) },
            { new: true }
        ).select('-password -firstname -lastname -updatedAt')

        if (!user) {
            res.statusCode = 400
            res.send(
                new Response(
                    'Cannot update data',
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }
        res.statusCode = 200
        res.send(new Response(user, res.statusCode).getStructuredResponse())
    } catch (error) {
        res.statusCode = 500
        res.send(
            new Response(
                'Cannot Update User ' + error,
                res.statusCode
            ).getStructuredResponse()
        )
    }
}

async function destroy(req, res) {
    try {
        const { id } = req.params
        const user = await User.findOneAndRemove({ _id: id })
        if (!user) {
            res.statusCode = 400
            res.send(
                new Response(
                    "Couldn'nt delete user",
                    res.statusCode
                ).getStructuredResponse()
            )
            return
        }
        res.statusCode = 200
        res.send(
            new Response(
                'User deleted successfully',
                res.statusCode
            ).getStructuredResponse()
        )
    } catch (error) {
        res.statusCode = 500
        res.send(
            new Response(
                'Cannot delete User ' + error,
                res.statusCode
            ).getStructuredResponse()
        )
    }
}

module.exports = {
    index,
    current,
    byId,
    create,
    update,
    destroy,
}
