const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({
    question: `${i}^2`,  // ← MathJaxで指数表記する形式（^2）
    answer: (i * i).toString()
  });
}
const GAS_URL = 'https://script.google.com/macros/s/AKfycby1RakykU-Sn_mpA-1g1rgjUOolyvEPxjfLOfavng-C1GeAvQjsbArBi2vx4JK2zKXv6Q/exec';
let currentQuestionIndex = 0;
let answers = [];
let correctCount = 0;
let incorrectDetails = [];
let timerInterval;
let timeLeft = 300;

document.getElementById('user-form').addEventListener('submit', function (e) {
  e.preventDefault();
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  startTimer();
  document.addEventListener("visibilitychange", handleVisibilityChange);
  showQuestion();
});

function startTimer() {
  const timerElement = document.getElementById("timer");
  timerElement.textContent = `残り時間: ${timeLeft}秒`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `残り時間: ${timeLeft}秒`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitAnswers();
    }
  }, 1000);
}

function showQuestion() {
  if (currentQuestionIndex >= quizData.length) {
    clearInterval(timerInterval);
    submitAnswers();
    return;
  }

  document.getElementById('question-text').innerHTML = `\\(${quizData[currentQuestionIndex].question}\\) =`;
  document.getElementById('answer-input').value = '';
  MathJax.typesetPromise();
}

document.getElementById('next-button').addEventListener('click', nextQuestion);
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    nextQuestion();
  }
});

function nextQuestion() {
  const input = document.getElementById('answer-input').value.trim();
  const correctAnswer = quizData[currentQuestionIndex].answer;
  answers.push(input);

  if (input === correctAnswer) {
    correctCount++;
  } else {
    incorrectDetails.push(`${quizData[currentQuestionIndex].question} = ${correctAnswer}（あなたの答え: ${input}）`);
  }

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
    clearInterval(timerInterval);
    submitAnswers();
  }
}

function submitAnswers() {
  const name = document.getElementById('name').value;
  const grade = document.getElementById('grade').value;
  const cls = document.getElementById('class').value;

  // 結果表示
  document.getElementById('quiz-screen').innerHTML = `
    <h2>結果発表</h2>
    <p>${correctCount}問正解 / ${quizData.length}問中</p>
    ${incorrectDetails.length > 0 ? `<h3>間違えた問題：</h3><ul>${incorrectDetails.map(e => `<li>${e}</li>`).join('')}</ul>` : '<p>全問正解です！</p>'}
  `;

  // データ送信
  fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      name,
      grade,
      class: cls,
      score: correctCount,
      answers
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(() => {
    console.log("データ送信完了");
  }).catch(error => {
    console.error("送信エラー:", error);
  });
}
