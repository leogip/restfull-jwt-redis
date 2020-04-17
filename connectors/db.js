const mongoose = require('mongoose')
const { MONGO_URI } = require('../config/app')

module.exports = {
    connect: () => {
        return new Promise((resolve, reject) => {
            mongoose.Promise = global.Promise

            mongoose.set(
                'debug',
                process.env.NODE_ENV === 'production' ? false : true
            )

            mongoose.connection
                .on('error', (error) => reject(error))
                .on('close', () => console.error('Database connection closed'))
                .on('open', () => resolve(mongoose.connections[0]))

            mongoose.connect(MONGO_URI, {
                useCreateIndex: true,
                useNewUrlParser: true,
                useFindAndModify: false,
                useUnifiedTopology: true,
            })
        })
    },
    User: require('../modules/user/user.model'),
    Token: require('../modules/token/token.model'),
}
