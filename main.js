const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({ question: `${i}^2`, answer: (i * i).toString() });
}

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyUBfzd81027j3AyZc-usU3UyhCIpD-FQ6Sed6gtxE7YbZY_Yr7-PiD7YjUht4G0Pug/exec';

let currentQuestionIndex = 0;
let answers = [];
let timerInterval;
let remainingTime = 60 * 3; // 3分

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
  // MathJax再描画
  if (window.MathJax) {
    MathJax.typesetPromise();
  }
}

document.getElementById('next-button').addEventListener('click', nextQuestion);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    nextQuestion();
  }
});

function nextQuestion() {
  const input = document.getElementById('answer-input').value.trim();
  if (input === "") {
    alert("答えを入力してください");
    return;
  }
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

  // 残りの未入力を空で埋める（何らかの理由で飛ばされた場合）
  while (answers.length < quizData.length) {
    answers.push("");
  }

  const score = quizData.reduce((acc, q, i) =>
    acc + (answers[i] === q.answer ? 1 : 0), 0);

  const incorrect = quizData
    .map((q, i) =>
      (answers[i] !== q.answer
        ? `${q.question}=${answers[i] || "未入力"}（正:${q.answer}）`
        : null))
    .filter(Boolean);

  fetch(GAS_URL, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      grade,
      class: cls,
      answers,
      score,
      reason: incorrect.join("; ")
    })
  })
    .then(response => response.text())
    .then(data => {
      alert(`${quizData.length}問中${score}問正解でした。\n\n【間違い】\n${incorrect.join("\n") || "なし"}`);
      location.reload();
    })
    .catch(error => {
      console.error('送信エラー:', error);
      alert('データ送信中にエラーが発生しました');
    });
}
