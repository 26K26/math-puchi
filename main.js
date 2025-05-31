const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({ question: `${i}^2`, answer: (i * i).toString() });
}
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzHx_is-u_72w2mMONJx0Dgh5WZtgHca1eSGSaKZpjE5S4ZtCYnM-Vqz1zKz1sr-TqEzw/exec';
let currentQuestionIndex = 0;
let answers = [];
let correctCount = 0;
let timer; let timeLeft = 180;

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
  
  document.getElementById('question-text').innerHTML = `\\(${quizData[currentQuestionIndex].question}\\) =`;
  document.getElementById('answer-input').value = '';
  MathJax.typeset();
}

document.getElementById('next-button').addEventListener('click', nextQuestion);
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') nextQuestion();
});

function nextQuestion() {
  const input = document.getElementById('answer-input').value.trim();
  answers.push(input);
  if (input === quizData[currentQuestionIndex].answer) correctCount++;
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

function startTimer() {
  const timerDiv = document.getElementById('timer');
  timer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDiv.textContent = `残り時間: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      submitAnswers();
    }
    timeLeft--;
  }, 1000);
}

function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    submitAnswers();
  }
}

function submitAnswers() {
  clearInterval(timer);
  const name = document.getElementById('name').value;
  const grade = document.getElementById('grade').value;
  const cls = document.getElementById('class').value;
  const wrongAnswers = quizData.map((q, i) => (q.answer !== answers[i]) ? `${q.question} → ${answers[i]}` : null).filter(Boolean);

.then(response => {
  if (!response.ok) throw new Error('Network response was not ok');
  return response.text();
})
.catch(err => {
  console.error('Fetch Error:', err);
  alert('送信エラー: ' + err.message);
});
