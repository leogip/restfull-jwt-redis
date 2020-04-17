const router = require('express').Router()
const { create } = require('../user/user.service')
const {
    login,
    confirmAccount,
    resendConfirmAccount,
    recover,
    reset,
    resetPassword,
    logout,
    verify,
} = require('./auth.service')
const verifyJWT = require('../../middlewares/verifyJWT')

router.post('/registration', create)
router.post('/login', login)
router.get('/confirm/:token', confirmAccount)
router.post('/resend', resendConfirmAccount)
router.post('/recover', recover)
router.get('/reset/:token', reset)
router.post('/reset/:token', resetPassword)
router.post('/logout', verifyJWT(['user', 'admin']), logout)
router.post('/verify', verifyJWT(['user', 'admin']), verify)

module.exports = router
