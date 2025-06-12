<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>数学小テスト</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- MathJax 読み込み -->
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script id="MathJax-script" async
    src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      margin: 20px;
      background-color: #f9f9f9;
    }

    #start-screen, #quiz-screen {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    }

    h2 {
      font-size: 24px;
      margin-bottom: 10px;
    }

    form label {
      display: block;
      margin: 15px 0;
      font-size: 18px;
      text-align: left;
    }

    form input, form select {
      font-size: 16px;
      padding: 5px;
      width: 100%;
      max-width: 300px;
      margin-top: 5px;
    }

    #question-text {
      font-size: 36px;
      margin-bottom: 20px;
    }

    #answer-input {
      font-size: 28px;
      width: 260px;
      height: 45px;
      margin: 15px auto;
      text-align: center;
      border: 2px solid #ccc;
      border-radius: 5px;
    }

    #keypad {
      margin: 20px auto;
      max-width: 280px;
    }

    #keypad button {
      width: 60px;
      height: 45px;
      margin: 4px;
      font-size: 18px;
      border: none;
      background-color: #e0e0e0;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    #keypad button:hover {
      background-color: #d0d0d0;
    }

    .button-group {
      margin-top: 20px;
    }

    .button-group button {
      padding: 10px 25px;
      font-size: 18px;
      margin: 0 10px;
      border: none;
      background-color: #4CAF50;
      color: white;
      border-radius: 5px;
      cursor: pointer;
    }

    .button-group button:hover {
      background-color: #45a049;
    }

    #timer {
      position: absolute;
      top: 10px;
      right: 20px;
      font-size: 18px;
      font-weight: bold;
      color: #d32f2f;
    }

    #quiz-screen {
      position: relative;
      display: none;
    }
  </style>
</head>
<body>

<!-- 開始画面 -->
<div id="start-screen">
  <h2>数学小テスト</h2>
  <form id="user-form">
    <label for="name">名前</label>
    <input type="text" id="name" required>

    <label for="grade">学年</label>
    <input type="text" id="grade" required>

    <label for="class">クラス</label>
    <select id="class" required>
      <option value="">選択してください</option>
      <option value="A">A</option>
      <option value="B">B</option>
    </select>

    <label for="number">出席番号</label>
    <select id="number" required>
      <option value="">選択してください</option>
      <!-- JavaScriptで動的に生成 -->
    </select>

    <div class="button-group">
      <button type="submit">開始</button>
    </div>
  </form>
</div>

<!-- テスト画面 -->
<div id="quiz-screen">
  <div id="timer"></div>

  <div id="question-text"></div>

  <input type="text" id="answer-input" readonly>

  <div id="keypad">
    <button type="button" onclick="insertSymbol('1')">1</button>
    <button type="button" onclick="insertSymbol('2')">2</button>
    <button type="button" onclick="insertSymbol('3')">3</button>
    <button type="button" onclick="insertSymbol('4')">4</button>
    <button type="button" onclick="insertSymbol('5')">5</button>
    <button type="button" onclick="insertSymbol('6')">6</button>
    <button type="button" onclick="insertSymbol('7')">7</button>
    <button type="button" onclick="insertSymbol('8')">8</button>
    <button type="button" onclick="insertSymbol('9')">9</button>
    <button type="button" onclick="insertSymbol('0')">0</button>
    <button type="button" onclick="insertSymbol('(')">(</button>
    <button type="button" onclick="insertSymbol(')')">)</button>
    <button type="button" onclick="insertSymbol('²')">x²</button>
    <button type="button" onclick="insertSymbol('√')">√</button>
    <button type="button" onclick="clearInput()">C</button>
    <button type="button" onclick="backspace()">←</button>
  </div>

  <div class="button-group">
    <button type="button" id="back-button">前へ</button>
    <button type="button" id="next-button">次へ</button>
  </div>
</div>

<!-- 出席番号オプションを動的に生成 -->
<script>
  window.addEventListener('DOMContentLoaded', () => {
    const numberSelect = document.getElementById('number');
    for (let i = 1; i <= 25; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      numberSelect.appendChild(opt);
    }
  });
</script>

<script src="main.js"></script>
</body>
</html>
const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({ question: `${i}^2`, answer: (i * i).toString() });
}

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzaEbohb33NPS8iYg8YmCB46xcd99OwvjuV28EUXt9elnQ7DTzaFJkcmF8r0ez_BIXEZQ/exec';

let currentQuestionIndex = 0;
let answers = Array(quizData.length).fill("");
let timerInterval;
let remainingTime = 60 * 3; // 3分

<script>
  // 出席番号セレクト生成（1〜25）
  window.addEventListener('DOMContentLoaded', () => {
    const numberSelect = document.getElementById('number');
    for (let i = 1; i <= 25; i++) {  // 理由：iが1から25以下までループする
      const opt = document.createElement('option');
      opt.value = opt.textContent = i;
      numberSelect.appendChild(opt);
    }
  });
</script>

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
    confirmSubmit();
    return;
  }

  const q = quizData[currentQuestionIndex];
  document.getElementById('question-text').innerHTML = `\\(${q.question.replace("^2", "^{2}")}\\) =`;
  document.getElementById('answer-input').value = answers[currentQuestionIndex] || '';
  document.getElementById('back-button').style.display = currentQuestionIndex > 0 ? 'inline-block' : 'none';

  if (window.MathJax) MathJax.typesetPromise();
}

document.getElementById('next-button').addEventListener('click', nextQuestion);
document.getElementById('back-button').addEventListener('click', previousQuestion);
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
  answers[currentQuestionIndex] = input;
  currentQuestionIndex++;
  showQuestion();
}

function previousQuestion() {
  const input = document.getElementById('answer-input').value.trim();
  answers[currentQuestionIndex] = input;
  currentQuestionIndex--;
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
    confirmSubmit();
  }
}

function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay();
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      confirmSubmit();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const min = Math.floor(remainingTime / 60);
  const sec = remainingTime % 60;
  document.getElementById('timer').textContent = `残り時間: ${min}:${sec.toString().padStart(2, '0')}`;
}

function confirmSubmit() {
  const proceed = confirm("解答を送信しますか？");
  if (proceed) {
    submitAnswers();
  }
}

async function submitAnswers() {
  clearInterval(timerInterval);
  document.getElementById('next-button').disabled = true;
  document.getElementById('back-button').disabled = true;

  const name = encodeURIComponent(document.getElementById('name').value);
  const grade = encodeURIComponent(document.getElementById('grade').value);
  const cls = encodeURIComponent(document.getElementById('class').value);
  const number = encodeURIComponent(document.getElementById('number').value);
  const answersStr = encodeURIComponent(answers.join(','));

  const score = quizData.reduce((acc, q, i) =>
    acc + (answers[i] === q.answer ? 1 : 0), 0);

  const incorrect = quizData
    .map((q, i) =>
      (answers[i] !== q.answer
        ? `${q.question}=${answers[i] || "未入力"}（正:${q.answer}）`
        : null))
    .filter(Boolean)
    .join('; ');
  const reason = encodeURIComponent(incorrect);

  const url = `${GAS_URL}?name=${name}&grade=${grade}&class=${cls}&number=${number}&answers=${answersStr}&score=${score}&reason=${reason}`;

  let success = false;
  for (let i = 0; i < 3; i++) {
    try {
      await fetch(url, { method: 'GET', mode: 'no-cors' });
      success = true;
      break;
    } catch (err) {
      console.warn(`送信リトライ ${i + 1} 回目失敗`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (!success) {
    alert("送信に失敗しました。通信環境を確認してください。");
    return;
  }

  alert(`${quizData.length}問中${score}問正解でした。\n\n【間違い】\n${incorrect || "なし"}`);
  location.reload();
}
