const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
    registerValidation,
    loginValidation,
    updateProfileValidation
} = require('../validators/authValidator');

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/google', authController.googleLogin);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, updateProfileValidation, validate, authController.updateProfile);

module.exports = router;
