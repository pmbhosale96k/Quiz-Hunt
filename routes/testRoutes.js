const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const TestResult = require("../models/TestResult");
const { verifyToken } = require("../middlewares/authMiddleware");

// 🎯 Start Test - Fetch Questions
router.post('/start', verifyToken, async (req, res) => {
  try {
    const difficulty = req.query.difficulty?.toLowerCase();
    if (!difficulty) return res.status(400).json({ message: "Difficulty is required" });

    // Optional: Pagination
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 30;  // Default to 30 questions

    const questions = await Question.find({ difficulty }).skip(page * limit).limit(limit);

    if (questions.length === 0) return res.status(404).json({ message: "No questions found" });

    res.json(questions);  // ✅ Return as array
  } catch (err) {
    console.error("Start Test Error:", err.message);
    res.status(500).json({ message: "Error fetching questions" });
  }
});

// ✅ Submit Test
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const answers = req.body.answers;

    let score = 0;

    const validAnswers = answers.filter(ans => ans.selectedAnswer); // only count answered
    const total = validAnswers.length;

    const resultDetails = [];

    for (const ans of validAnswers) {
      const q = await Question.findById(ans.questionId);
      const isCorrect = q.correctAnswer === ans.selectedAnswer;

      if (isCorrect) score++;

      resultDetails.push({
        questionId: q._id,
        selected: ans.selectedAnswer,
        corrected: q.correctAnswer
      });


    }

    const result = new TestResult({
      userId,
      score,
      total,
      answer: resultDetails
    });

    await result.save();
    const results = await TestResult.find({ userId });
    console.log("📊 User all results:", results);




    res.json({ message: "Test submitted", score, total });
  } catch (err) {
    console.error("Submit Error:", err.message);
    res.status(500).json({ message: "Error submitting test", error: err.message });
  }
});

// 🏆 Leaderboard
// 🏆 Leaderboard: Show users only if someone has a non-zero score
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await TestResult.aggregate([
  {
    $group: {
      _id: "$userId",
      highestScore: { $max: "$score" },  // ✅ Get only the best score
      attempts: { $sum: 1 }
    }
  },
  {
    $match: {
      highestScore: { $gt: 0 } // ✅ Ignore users with 0 scores
    }
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


    res.render("manageUser",{users:leaderboard});
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard", error: err.message });
  }
});


// 🕓 Test History (My Attempts)
router.get('/my-history', verifyToken, async (req, res) => {
  try {
    const history = await TestResult.find({ userId: req.user._id })
      .sort({ testDate: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error: error.message });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
})

module.exports = router;
