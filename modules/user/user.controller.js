const router = require('express').Router()
const {
    index,
    current,
    byId,
    create,
    update,
    destroy,
} = require('./user.service')
const verifyJWT = require('../../middlewares/verifyJWT')

router.use(verifyJWT(['admin', 'user']))

router.get('/', index)
router.get('/current', current)
router.get('/:id', byId)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', destroy)

module.exports = router
