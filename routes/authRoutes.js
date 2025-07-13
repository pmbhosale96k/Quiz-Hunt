const express = require('express');
const router = express.Router();
const { signup, loginUser } = require('../controllers/authController');

// 👤 User Signup (POST /api/auth/signup)
router.post('/signup', signup);

// 🔐 User Login (POST /api/auth/login)
router.post('/login', loginUser);

// 🚪 User Logout (GET /api/auth/logout)
router.get('/logout', (req, res) => {
  res.clearCookie('token');  // removes the JWT token from browser cookies
  res.redirect('/login');    // redirects to login page
});

module.exports = router;
