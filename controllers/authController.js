const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Create JWT Token
const createToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};

// Signup handler
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { error: 'Email already exists' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.redirect('/login');
  } catch (error) {
    res.render('signup', { error: 'Server error. Please try again.' });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.role !== 'user') {
    return res.render('login', { error: 'Invalid user credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render('login', { error: 'Invalid password' });
  }

  const token = createToken(user);
  res.cookie('token', token, { httpOnly: true });
  res.redirect('/dashboard');
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await User.findOne({ email });

  if (!admin || admin.role !== 'admin') {
    return res.render('admin-login', { error: 'Not an admin account' });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.render('admin-login', { error: 'Wrong password' });
  }

  const token = createToken(admin);
  res.cookie('token', token, { httpOnly: true });
  res.redirect('/dashboard');
};


