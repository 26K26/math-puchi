const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({ question: `${i}^2`, answer: (i * i).toString() });
}

// [重要] 最新のGASデプロイURLに置き換えてください
const GAS_URL = 'https://script.google.com/macros/s/AKfycbw8DkxAdoE_uiU47kudymJKmQI-pkJRpWQ1MGT504PqIQ4x6MetrmGDB1VheOfLU7gPNA/exec';

let currentQuestionIndex = 0;
let answers = [];
let correctCount = 0;
let timer;
let timeLeft = 180;

document.getElementById('user-form').addEventListener('submit', function (e) {
  e.preventDefault();
  
  // [追加] 入力値チェック
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

// [変更] タイマー表示の不具合修正
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

// [重要] submitAnswers関数の完全修正版
function submitAnswers() {
  clearInterval(timer);
  const name = document.getElementById('name').value;
  const grade = document.getElementById('grade').value;
  const cls = document.getElementById('class').value;

  // 未回答問題の補完処理
  while (answers.length < quizData.length) {
    answers.push('');
  }

  const wrongAnswers = quizData.map((q, i) => 
    (q.answer !== answers[i]) ? `${q.question} → ${answers[i]}` : null
  ).filter(Boolean);

  // [修正] fetch処理の完全版
  fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      name, 
      grade, 
      class: cls,
      answers: answers.slice(0, quizData.length), // 配列長調整
      score: correctCount,
      reason: wrongAnswers.join(', ') || 'なし'
    }),
    headers: { 
      'Content-Type': 'text/plain',
      'X-Requested-With': 'XMLHttpRequest' // [追加] CORS対策
    },
    redirect: 'follow'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status} ${response.statusText}`);
    }
    return response.text();
  })
  .then(result => {
    console.log('送信成功:', result);
    alert(`${correctCount}/${quizData.length}問正解！\n3秒後に再読み込みします`);
    setTimeout(() => location.reload(), 3000);
  })
  .catch(error => {
    console.error('送信エラー:', error);
    alert(`送信失敗: ${error.message}\n画面を再読み込みします`);
    location.reload();
  });
}
