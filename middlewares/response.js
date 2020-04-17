class Response {
    constructor(message, statusCode, meta) {
        this.validateMessage(message)
        this.validateStatusCode(statusCode)
        this.meta = meta
    }

    validateMessage(message) {
        if (!message) {
            throw new Error('Response Message Required')
        }
        this.message = message
    }

    validateStatusCode(statusCode) {
        if (!statusCode) {
            this.statusCode = 200
        } else if (!isNaN(statusCode)) {
            this.statusCode = statusCode
        } else {
            throw new Error('Invalid StatusCode')
        }
    }

    getStructuredResponse() {
        if (this.statusCode === 200) {
            return {
                success: {
                    message: this.message,
                    meta: this.meta,
                },
                statusCode: this.statusCode,
            }
        }
        return {
            error: {
                message: this.message,
                meta: this.meta,
            },
            statusCode: this.statusCode,
        }
    }
}

module.exports = Response
