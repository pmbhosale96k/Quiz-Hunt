const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const  TestResult=require('../models/TestResult');
// 🔐 Apply middleware globally — all routes below are admin-only
router.use(verifyToken, isAdmin);

// ✅ Add Question
router.post('/add', verifyToken, isAdmin, async (req, res) => {
  try {
    const { question, option1, option2, option3, option4, correctAnswer, type, difficulty, tags } = req.body;

    const newQuestion = new Question({
      question,
      option: [option1, option2, option3, option4],
      correctAnswer,
      type,
      difficulty,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
    });

    await newQuestion.save();
    res.redirect('/add-question?added=success');
  } catch (error) {
    console.error('Add Question Error:', error.message);
    res.status(500).json({ message: '❌ Error adding question' });
  }
});


// 🔄 Update Question
router.post('/update/:id', async (req, res) => {
  const { question, option1, option2, option3, option4, correctAnswer, type, difficulty, tags } = req.body;

  const updatedOptions = [option1, option2, option3, option4];

  await Question.findByIdAndUpdate(req.params.id, {
    question,
    option: updatedOptions,
    correctAnswer,
    type,
    difficulty,
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
  });

  res.redirect('/admin/all');
});

// ❌ Delete Question
router.post('/delete/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.redirect('/admin/all?deleted=success');
  } catch (err) {
    res.status(500).json({ message: '❌ Failed to delete question' });
  }
});


// 📋 Get All Questions with Filter
router.get('/all', verifyToken, isAdmin, async (req, res) => {
  const { keyword, difficulty, tag, type ,deleted} = req.query;
  const query = {};

  if (keyword) query.question = { $regex: keyword, $options: 'i' };
  if (difficulty) query.difficulty = difficulty;
  if (tag) query.tags = tag;
  if (type) query.type = type;

  try {
    const questions = await Question.find(query);
    res.render('allQuestions', { questions, keyword, difficulty, tag, type ,deleted});
  } catch (err) {
    console.error(err);
    res.render('allQuestions', { questions: [], keyword, difficulty, tag, type,deleted });
  }
});


//edit the ques
router.get('/edit-question/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    res.render('editQuestion', { question })
  } catch (err) {
    res.status(500).send('❌ Failed to load edit form');

  }
});

//search on the basis of tag,diff
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const leaderboard = await TestResult.aggregate([
      {
        $group: {
          _id: "$userId",
          highestScore: { $max: "$score" },
          attempts: { $sum: 1 }
        }
      },
      {
        $match: { highestScore: { $gt: 0 } }
      },
      { $sort: { highestScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          username: "$user.username",
          email: "$user.email",
          highestScore: 1,
          attempts: 1
        }
      }
    ]);

    res.render("manageUser", { users: leaderboard });
  } catch (err) {
    console.error("❌ Error fetching leaderboard:", err.message);
    res.status(500).send("Error loading leaderboard");
  }
});


//User Stats 
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalQuestions = await Question.countDocuments();

    const avgScoreData = await TestResult.find()
      .populate('userId')
      .sort({ score: -1 });

    res.render('stats', {
      totalUsers,
      totalQuestions,
      avgScoreData,
    })

  } catch (err) {
    console.error("Error fetching test stats:", err.message);
    res.status(500).json({ message: "❌ Failed to load test stats" });
  }
});


//LOGOUT BY CLEARING THE SESION
router.get('/logout',(req,res)=>{
  res.clearCookie('token');
  res.redirect('/login');
})

module.exports = router;
