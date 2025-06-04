const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({ question: `${i}^2`, answer: (i * i).toString() });
}

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzaEbohb33NPS8iYg8YmCB46xcd99OwvjuV28EUXt9elnQ7DTzaFJkcmF8r0ez_BIXEZQ/exec';

let currentQuestionIndex = 0;
let answers = Array(quizData.length).fill("");
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

  const name = document.getElementById('name').value;
  const grade = document.getElementById('grade').value;
  const cls = document.getElementById('class').value;

  const score = quizData.reduce((acc, q, i) =>
    acc + (answers[i] === q.answer ? 1 : 0), 0);

  const incorrect = quizData
    .map((q, i) =>
      (answers[i] !== q.answer
        ? `${q.question}=${answers[i] || "未入力"}（正:${q.answer}）`
        : null))
    .filter(Boolean);

  const payload = {
    name,
    grade,
    class: cls,
    answers,
    score,
    reason: incorrect.join('; ')
  };

  let success = false;
  for (let i = 0; i < 3; i++) {
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
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

  alert(`${quizData.length}問中${score}問正解でした。\n\n【間違い】\n${incorrect.join("\n") || "なし"}`);
  location.reload();
}
