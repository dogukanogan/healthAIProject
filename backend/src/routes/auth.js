const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const activityLogger = require('../middleware/activityLogger');

router.post('/register', activityLogger('register'), authController.register);
router.post('/login', activityLogger('login'), authController.login);
router.post('/logout', activityLogger('logout'), authController.logout);
router.get('/me', verifyToken, activityLogger('get_me'), authController.me);
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;
