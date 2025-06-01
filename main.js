const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({ question: `${i}^2`, answer: (i * i).toString() });
}
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzyg5vhbe5uwihWQvhPXVa1Vbi_xODAzNTpVFs3RFUGFlX2aJ2GBSQYcWdhz590vPzAGQ/exec'; // ← 適切なURLに置き換えてください

let currentQuestionIndex = 0;
let answers = [];
let timerInterval;
let remainingTime = 60 * 3; // 5分（必要に応じて調整）

document.getElementById('user-form').addEventListener('submit', function (e) {
  e.preventDefault();
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  document.addEventListener("visibilitychange", handleVisibilityChange);
  startTimer();
  showQuestion();
});

function showQuestion() {
  if (currentQuestionIndex >= quizData.length) {
    submitAnswers();
    return;
  }
  const q = quizData[currentQuestionIndex];
  document.getElementById('question-text').innerHTML = `\\(${q.question.replace("^2", "^{2}")}\\) =`;
  document.getElementById('answer-input').value = '';
  MathJax.typeset();
}

document.getElementById('next-button').addEventListener('click', nextQuestion);
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') nextQuestion();
});

function nextQuestion() {
  const input = document.getElementById('answer-input').value.trim();
  answers.push(input);
  currentQuestionIndex++;
  showQuestion();
}

function insertSymbol(sym) {
  const input = document.getElementById('answer-input');
  input.value += sym;
}

function backspace() {
  const input = document.getElementById('answer-input');
  input.value = input.value.slice(0, -1);
}

function clearInput() {
  document.getElementById('answer-input').value = '';
}

function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    submitAnswers();
  }
}

function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay();
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      submitAnswers();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const min = Math.floor(remainingTime / 60);
  const sec = remainingTime % 60;
  document.getElementById('timer').textContent = `残り時間: ${min}:${sec.toString().padStart(2, '0')}`;
}

function submitAnswers() {
  clearInterval(timerInterval);

  const name = document.getElementById('name').value;
  const grade = document.getElementById('grade').value;
  const cls = document.getElementById('class').value;

  const score = quizData.reduce((acc, q, i) =>
    acc + (answers[i] === q.answer ? 1 : 0), 0);
  const incorrect = quizData
    .map((q, i) => (answers[i] !== q.answer ? `${q.question}=${answers[i]}（正:${q.answer}）` : null))
    .filter(Boolean);

  fetch(https://script.google.com/macros/s/AKfycbwf6JwSY_JzhR0QbKUI4bMJDTKfh-5HpWgXYKEtop8D8o5JmiGYivaDcFU0-aqjdtulcQ/exec, {
    method: 'POST',
    body: JSON.stringify({
      name,
      grade,
      class: cls,
      answers,
      score,
      reason: incorrect.join("; ")
    }),
    headers: { 'Content-Type': 'application/json' }
  }).then(() => {
    alert(`${quizData.length}問中${score}問正解でした。\n\n【間違い】\n${incorrect.join("\n") || "なし"}`);
  
  });
}
