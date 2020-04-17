const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4 } = require('uuid')
const { secret, expiresIn } = require('../../config/app').JWT

const UserSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: (v) => /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v),
                message: (props) => `${props.value} is not a valid email id!`,
            },
        },
        password: {
            type: String,
            required: true,
            min: [6, 'Password too small'],
        },
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        },
        isVerified: { type: Boolean, default: false },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
        resetPasswordToken: {
            type: String,
            required: false,
        },
        resetPasswordExpires: {
            type: Date,
            required: false,
        },
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
)

UserSchema.set('toJSON', { virtuals: true })
UserSchema.virtual('fullname').get(function () {
    return this.firstname + ' ' + this.lastname
})

UserSchema.pre('save', function (next) {
    const user = this

    if (!user.isModified('password')) return next()

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err)

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err)

            user.password = hash
            next()
        })
    })
})

UserSchema.methods.generateJWT = function () {
    let exp = Math.floor(Date.now() / 1000) + expiresIn
    const jti = v4()

    const payload = {
        id: this._id,
        jti,
        role: this.role,
        iat: Math.floor(Date.now() / 1000),
        exp,
    }

    return {
        token: jwt.sign(payload, secret, {
            algorithm: 'HS256',
        }),
        jti,
        exp,
    }
}

UserSchema.methods.generatePasswordReset = function () {
    this.resetPasswordToken = v4()
    this.resetPasswordExpires = Date.now() + 3600000
}

const User = model('User', UserSchema)

module.exports = User
