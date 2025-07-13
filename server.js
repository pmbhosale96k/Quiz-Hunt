// 🔹 Import Core Modules
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const TestResult=require('./models/TestResult');

// 🔹 Environment Config
dotenv.config();

// 🔹 DB Connection
const connectDB = require('./config/db');
connectDB();  // Connect to MongoDB

// 🔹 Initialize Express App
const app = express();

//  MIDDLEWARE SETUP
app.use(express.json());                             // Parse incoming JSON
app.use(express.urlencoded({ extended: true }));     // Parse URL-encoded data
app.use(cookieParser());                             // Enable cookie parsing
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// EJS View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// JWT Auth Middleware
const { verifyToken } = require('./middlewares/authMiddleware');

//  EJS PAGES (Frontend Routes)

// 🔸 Public Pages
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/admin-login', (req, res) => res.render('admin-login'));

// 🔸 Authenticated User Pages (verifyToken required)
app.get('/test', verifyToken, (req, res) => res.render('test', { user: req.user }));

app.get('/result', verifyToken, (req, res) => {
  const { score, total } = req.query;
  res.render('result', {
  user: req.user,
  score: Number(score),
  total: Number(total)
});
});

app.get('/history',verifyToken,async (req,res)=>{
  try {
    const history=await TestResult.find({userId:req.user._id}).sort({testDate:-1});
    res.render('history',{user:req.user,history});
  } catch (err) {
     console.error("❌ Error loading history:", err.message);
    res.status(500).send("Error loading history");
  }
})
app.get('/add-question', verifyToken, (req, res) => res.render('addQuestion', { user: req.user }));

app.get('/add-question', verifyToken, (req, res) => {
  const {added}=req.query;
  res.render('addQuestion', { user: req.user ,added});
});


// 🔸 User Dashboard (non-admin only)
app.get('/dashboard', verifyToken, (req, res) => {
  if (req.user.role === 'admin') return res.redirect('/admin-dashboard');
  res.render('userDashboard', { user: req.user });
});

// 🔸 Admin Dashboard (admin only)
app.get('/admin-dashboard', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Access denied');
  res.render('admin-dashboard', { user: req.user });
});

// ROUTES (API & Logic Handlers)
app.use('/api/auth', require('./routes/authRoutes'));            // User signup/login
app.use('/api/admin', require('./routes/adminAuthRoutes'));      // Admin login route
app.use('/admin', require('./routes/adminRoutes'));              // Admin features (add, update, delete questions, stats)

app.use('/api/test', require('./routes/testRoutes'));

//  SERVER START
const PORT = process.env.PORT || 1111;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
