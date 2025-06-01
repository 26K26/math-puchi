const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({ question: `${i}^2`, answer: (i * i).toString() });
}

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyslzA-z6CuvigPFQr6_9B3ltxBFy6iMDrFbwzzG7-UXHaBP_xHXdZp0ocrEI-LpyxP5A/exec';

let currentQuestionIndex = 0;
let answers = [];
let correctCount = 0;
let timer;
let timeLeft = 180;

document.getElementById('user-form').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!document.getElementById('name').value.trim()) {
    alert('名前を入力してください');
    return;
  }
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

  const questionElement = document.getElementById('question-text');
  const answerInput = document.getElementById('answer-input');
  
  // 問題文更新
  questionElement.innerHTML = `\\(${quizData[currentQuestionIndex].question}\\) =`;
  answerInput.value = '';

  // MathJaxレンダリング（Promise使用）
  MathJax.typesetPromise([questionElement])
    .then(() => {
      console.log('数式レンダリング成功');
    })
    .catch(err => {
      console.error('数式レンダリングエラー:', err);
    });
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

  while (answers.length < quizData.length) {
    answers.push('');
  }

  const wrongAnswers = quizData.map((q, i) => 
    (q.answer !== answers[i]) ? `${q.question} → ${answers[i]}` : null
  ).filter(Boolean);

  // 修正箇所: fetch処理の完全なチェーン
 fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      name, grade, class: cls,
      answers: answers.slice(0, quizData.length),
      score: correctCount,
      reason: wrongAnswers.join(', ') || 'なし'
    }),
    headers: {
      'Content-Type': 'text/plain',
      'X-Requested-With': 'XMLHttpRequest'
    },
    redirect: 'manual' // 変更箇所
  })
  .then(response => {
    // GASのリダイレクト対策
    if (response.type === 'opaqueredirect') {
      throw new Error('リダイレクトがブロックされました');
    }
    if (!response.ok) throw new Error(`HTTPエラー: ${response.status}`);
    return response.text();
  })
  .then(result => {
    console.log('送信成功:', result);
    alert('結果を記録しました！');
    location.href = '完了ページのURL'; // 明示的な遷移
  })
  .catch(error => {
    console.error('エラー詳細:', error);
    alert(`送信失敗: ${error.message}\n管理者へ連絡してください`);
  });
}
