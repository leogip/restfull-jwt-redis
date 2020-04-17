const { Schema, model } = require('mongoose')
const { expiresIn } = require('../../config/app').MAIL

var TokenSchema = new Schema({
    _userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: expiresIn,
    },
})

module.exports = model('Token', TokenSchema)
