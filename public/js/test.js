const startForm = document.getElementById('startForm');
const questionContainer = document.getElementById('questionContainer');
const submitBtn = document.getElementById('submitbtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const questionCountDisplay = document.getElementById('questionCount');
const timerDisplay = document.getElementById('timerDisplay');

let questions = [];
let answers = [];
let currentIndex = 0;
let timer;
let durationInMinutes = 2;

// ✅ Start test
startForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const difficulty = document.getElementById('difficulty').value;

  document.getElementById('difficultyBox').style.display = 'none';
  document.getElementById('testBox').style.display = 'block';

  try {
    const res = await fetch(`/api/test/start?difficulty=${difficulty}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    questions = Array.isArray(data.que) ? data.que : data;
    if (!questions || questions.length === 0) return alert("⚠️ No questions found.");

    answers = Array(questions.length).fill(null); // ⬅️ Initialize blank answers
    renderCurrentQuestion();
    startTimer(durationInMinutes * 60);
  } catch (err) {
    console.error("❌ Error loading test:", err);
    alert("❌ Server error while starting test");
  }
});

// ✅ Render current question
function renderCurrentQuestion() {
  const q = questions[currentIndex];
  questionContainer.innerHTML = `<h3>Q${currentIndex + 1}: ${q.question}</h3>`;

  q.option.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.className = 'option-btn';

    // pre-select logic
    if (answers[currentIndex]?.selectedAnswer === opt) {
      btn.classList.add('selected');
    }

    btn.onclick = () => {
      answers[currentIndex] = { questionId: q._id, selectedAnswer: opt };
      document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };

    questionContainer.appendChild(btn);
  });

  // Update question count
  questionCountDisplay.textContent = `✅ Question ${currentIndex + 1} of ${questions.length}`;

  // Toggle nav buttons
  prevBtn.style.display = currentIndex > 0 ? 'inline-block' : 'none';
  nextBtn.style.display = currentIndex < questions.length - 1 ? 'inline-block' : 'none';
  submitBtn.style.display = currentIndex === questions.length - 1 ? 'inline-block' : 'none';
}

// ✅ Navigation buttons
nextBtn.addEventListener('click', () => {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderCurrentQuestion();
  }
});

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderCurrentQuestion();
  }
});

// ✅ Timer
function startTimer(seconds) {
  let timeLeft = seconds;
  timer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerDisplay.textContent = `⏳ Time Left: ${minutes}:${secs < 10 ? '0' + secs : secs}`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);
      alert("⏰ Time's up!");
      submitTest();
    }
  }, 1000);
}

// ✅ Submit test
submitBtn.addEventListener('click', submitTest);

async function submitTest() {
  clearInterval(timer);

  const unanswered = answers.filter(a => !a).length;
  if (unanswered > 0) {
    return alert(`❌ You must answer all ${questions.length} questions. ${unanswered} unanswered.`);
  }

  try {
    const res = await fetch('/api/test/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });

    const data = await res.json();
    if (res.ok) {
      alert(`✅ Your Score: ${data.score}`);
      window.location.href = `/result?score=${data.score}&total=${data.total}`;
    } else {
      alert("❌ Failed to submit test");
    }
  } catch (err) {
    console.error("🚨 Submit error:", err);
    alert("❌ Error submitting test");
  }
}
