const { CronJob } = require('cron')
const client = require('../connectors/redis-client')
const { cron } = require('../config/app').REDIS

new CronJob(
    cron,
    () => {
        client.keys('*', (err, keys) => {
            for (let i = 0; i < keys.length; i += 1) {
                client.hgetall(keys[i], (error, response) => {
                    if (err) {
                        console.log(err)
                        return
                    }
                    Object.keys(response).map((key) => {
                        if (key.includes('exp-')) {
                            if (
                                Number(response[key]) <
                                Math.floor(Date.now() / 1000)
                            ) {
                                client.hdel(
                                    keys[i],
                                    [key.split('exp-')[1], key],
                                    (e) => {
                                        if (e) {
                                            console.log(e)
                                        }
                                    }
                                )
                            }
                        }
                    })
                })
            }
        })
    },
    null,
    true
)
