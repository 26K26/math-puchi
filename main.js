const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({ question: `${i}^2`, answer: (i * i).toString() });
}
const GAS_URL = 'https://script.google.com/macros/s/AKfycby1RakykU-Sn_mpA-1g1rgjUOolyvEPxjfLOfavng-C1GeAvQjsbArBi2vx4JK2zKXv6Q/exec';
let currentQuestionIndex = 0;
let answers = [];
let correctCount = 0;
let incorrectDetails = [];
let timerInterval;

document.getElementById('user-form').addEventListener('submit', function (e) {
  e.preventDefault();
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  document.addEventListener('visibilitychange', handleVisibilityChange);
  startTimer();
  showQuestion();
});

function showQuestion() {
  if (currentQuestionIndex >= quizData.length) {
    submitAnswers();
    return;
  }
  document.getElementById('question-text').innerHTML = `\(${quizData[currentQuestionIndex].question}\) =`;
  document.getElementById('answer-input').value = '';
  MathJax.typeset();
}

document.getElementById('next-button').addEventListener('click', nextQuestion);
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') nextQuestion();
});

function nextQuestion() {
  const input = document.getElementById('answer-input').value.trim();
  const correct = quizData[currentQuestionIndex].answer;
  answers.push(input);
  if (input === correct) {
    correctCount++;
  } else {
    incorrectDetails.push(`問題 ${currentQuestionIndex + 1}: ${quizData[currentQuestionIndex].question} = ${correct}（あなたの答え: ${input}）`);
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
    submitAnswers();
  }
}

function startTimer() {
  let timeLeft = 300;
  document.getElementById('time-left').textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('time-left').textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitAnswers();
    }
  }, 1000);
}

function submitAnswers() {
  clearInterval(timerInterval);
  document.getElementById('quiz-screen').style.display = 'none';
  const name = document.getElementById('name').value;
  const grade = document.getElementById('grade').value;
  const cls = document.getElementById('class').value;

  const resultText = `正解数: ${correctCount} / ${quizData.length}<br><br>${incorrectDetails.join('<br>')}`;
  document.getElementById('result-screen').innerHTML = `<h2>結果</h2><p>${resultText}</p>`;
  document.getElementById('result-screen').style.display = 'block';

  fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      name,
      grade,
      class: cls,
      score: correctCount,
      answers,
      reason: incorrectDetails
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
