const express = require('express');
const router = express.Router();

const recoverPasswController = require('../controllers/recoverPasswController');

router.post('/forgot-password',recoverPasswController.forgot_password);
router.post('/verify-reset-code',recoverPasswController.verify_reset_code);
router.post('/reset-password', recoverPasswController.reset_password);

module.exports = router;