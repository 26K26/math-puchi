const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({ question: `${i}^2`, display: `${i}^2`, answer: (i * i).toString() });
}

const GAS_URL = 'https://script.google.com/macros/s/AKfycby1RakykU-Sn_mpA-1g1rgjUOolyvEPxjfLOfavng-C1GeAvQjsbArBi2vx4JK2zKXv6Q/exec';
let currentQuestionIndex = 0;
let answers = [];
let correctCount = 0;
let timer;
let timeLeft = 180;

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
  const q = quizData[currentQuestionIndex].display;
  document.getElementById('question-text').innerHTML = `\\(${q}\\) =`;
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

  const wrongAnswers = quizData.map((q, i) => {
    if (q.answer !== answers[i]) {
      return `\\(${q.display}\\) → あなたの答え: ${answers[i] || '(空欄)'}（正解: ${q.answer}）`;
    }
    return null;
  }).filter(Boolean);

  const resultMessage = `
    送信完了！${quizData.length}問中${correctCount}問正解でした。
    ${wrongAnswers.length > 0 ? '\n間違い:\n' + wrongAnswers.join('\n') : ''}
  `;

  fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      name,
      grade,
      class: cls,
      answers,
      score: correctCount,
      reason: wrongAnswers.join(', ')
    }),
    headers: { 'Content-Type': 'application/json' }
  }).then(() => {
    // 結果をHTMLで表示
    document.body.innerHTML = `
      <h2>テスト結果</h2>
      <p>${quizData.length}問中<strong>${correctCount}</strong>問正解でした。</p>
      ${wrongAnswers.length > 0 ? '<h3>間違った問題:</h3><ul>' + wrongAnswers.map(ans => `<li>\\(${ans}\\)</li>`).join('') + '</ul>' : ''}
    `;
    MathJax.typeset();
  });
}
