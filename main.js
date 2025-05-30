
const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({ question: `${i}^2`, answer: (i * i).toString() });
}
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwQ3d4LnSBzRsBRR4Vsoy5l_UN6ckB4p85D_Ez40wNIGinO_YfoC72PVHuXclv-fTvb9w/exec';
let currentQuestionIndex = 0;
let answers = [];
let hasSubmitted = false;

document.getElementById('user-form').addEventListener('submit', function (e) {
  e.preventDefault();
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  document.addEventListener("visibilitychange", handleVisibilityChange);
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
  if (e.key === 'Enter') {
    e.preventDefault();
    nextQuestion();
  }
});

function nextQuestion() {
  if (hasSubmitted) return;
  const input = document.getElementById('answer-input').value.trim();
  answers.push(input);
  currentQuestionIndex++;

  if (currentQuestionIndex >= quizData.length) {
    submitAnswers();
  } else {
    showQuestion();
  }
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

function submitAnswers() {
  if (hasSubmitted) return;
  hasSubmitted = true;
  const name = document.getElementById('name').value;
  const grade = document.getElementById('grade').value;
  const cls = document.getElementById('class').value;
  fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      name,
      grade,
      class: cls,
      answers
    }),
    headers: {
      'Content-Type': 'text/plain'
    }
  }).then(() => {
    alert('解答を送信しました。');
    location.reload();
  });
}
