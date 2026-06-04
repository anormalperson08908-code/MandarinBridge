// ========================================
// CLEAR OLD CACHE
// ========================================

localStorage.clear();

// ========================================
// QUIZ DATA
// ========================================

const freshQuizData = [

  {
    id: 1,
    category: "shopping",
    question: "Shopkeeper: 你好！你想买什么？",
    translation: "(What would you like to buy?)",
    choices: [
      "我是学生。",
      "我想买咖啡。",
      "我今年二十岁。"
    ],
    correct: 1
  },

  {
    id: 2,
    category: "school",
    question: "Teacher: 你叫什么名字？",
    translation: "(What is your name?)",
    choices: [
      "我叫David。",
      "我喜欢苹果。",
      "我在学校。"
    ],
    correct: 0
  },

  {
    id: 3,
    category: "greetings",
    question: "Friend: 你好吗？",
    translation: "(How are you?)",
    choices: [
      "谢谢。",
      "我很好。",
      "再见。"
    ],
    correct: 1
  },

  {
    id: 4,
    category: "shopping",
    question: "Waiter: 你想喝什么？",
    translation: "(What would you like to drink?)",
    choices: [
      "我想喝茶。",
      "我是老师。",
      "我住新加坡。"
    ],
    correct: 0
  },

  {
    id: 5,
    category: "greetings",
    question: "Friend: 早上好！",
    translation: "(Good morning!)",
    choices: [
      "早上好！",
      "谢谢。",
      "晚安。"
    ],
    correct: 0
  },

  {
    id: 6,
    category: "school",
    question: "Teacher: 你今天忙吗？",
    translation: "(Are you busy today?)",
    choices: [
      "有一点。",
      "我喜欢猫。",
      "再见。"
    ],
    correct: 0
  },

  {
    id: 7,
    category: "shopping",
    question: "Cashier: 你付现金还是刷卡？",
    translation: "(Cash or card?)",
    choices: [
      "刷卡。",
      "我是学生。",
      "我喜欢中文。"
    ],
    correct: 0
  },

  {
    id: 8,
    category: "greetings",
    question: "Friend: 明天见！",
    translation: "(See you tomorrow!)",
    choices: [
      "明天见！",
      "谢谢。",
      "晚安。"
    ],
    correct: 0
  },

  {
    id: 9,
    category: "shopping",
    question: "Customer: 这个多少钱？",
    translation: "(How much is this?)",
    choices: [
      "二十块。",
      "我是学生。",
      "谢谢。"
    ],
    correct: 0
  },

  {
    id: 10,
    category: "school",
    question: "Classmate: 你喜欢中文吗？",
    translation: "(Do you like Chinese?)",
    choices: [
      "喜欢！",
      "不要。",
      "再见。"
    ],
    correct: 0
  },

  {
    id: 11,
    category: "greetings",
    question: "Friend: 谢谢你！",
    translation: "(Thank you!)",
    choices: [
      "不客气。",
      "你好。",
      "今天星期五。"
    ],
    correct: 0
  },

  {
    id: 12,
    category: "shopping",
    question: "Server: 你想吃什么？",
    translation: "(What would you like to eat?)",
    choices: [
      "我想吃面。",
      "我喜欢音乐。",
      "我是老师。"
    ],
    correct: 0
  },

  {
    id: 13,
    category: "school",
    question: "Teacher: 你懂吗？",
    translation: "(Do you understand?)",
    choices: [
      "懂。",
      "谢谢。",
      "不要。"
    ],
    correct: 0
  },

  {
    id: 14,
    category: "greetings",
    question: "Friend: 最近怎么样？",
    translation: "(How have you been recently?)",
    choices: [
      "很好，谢谢。",
      "我是学生。",
      "今天星期六。"
    ],
    correct: 0
  },

  {
    id: 15,
    category: "shopping",
    question: "Vendor: 还要别的吗？",
    translation: "(Anything else?)",
    choices: [
      "不用了，谢谢。",
      "我喜欢狗。",
      "再见。"
    ],
    correct: 0
  }

];

// ========================================
// CACHE
// ========================================

const CACHE_KEY = "mandarinQuizCache";

function loadQuizData() {

  const cached =
    localStorage.getItem(CACHE_KEY);

  if (cached) {

    return JSON.parse(cached);

  }

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify(freshQuizData)
  );

  return freshQuizData;
}

const quizData = loadQuizData();

// ========================================
// VARIABLES
// ========================================

let filteredData = [...quizData];

let currentQuestion = 0;

let score = 0;

let answered = false;

// ========================================
// ELEMENTS
// ========================================

const questionCounter =
  document.getElementById(
    "question-counter"
  );

const questionText =
  document.getElementById(
    "question-text"
  );

const translationText =
  document.getElementById(
    "translation-text"
  );

const choicesContainer =
  document.getElementById(
    "choices-container"
  );

const feedback =
  document.getElementById(
    "feedback"
  );

const nextBtn =
  document.getElementById(
    "next-btn"
  );

const finalScore =
  document.getElementById(
    "final-score"
  );

const quizCard =
  document.getElementById(
    "quiz-card"
  );

// ========================================
// RENDER QUESTION
// ========================================

function renderQuestion() {

  answered = false;

  feedback.innerHTML = "";

  nextBtn.style.display = "none";

  const question =
    filteredData[currentQuestion];

  if (!question) {

    quizCard.style.display = "none";

    finalScore.style.display = "block";

    const percentage =
      Math.round(
        (score / filteredData.length) * 100
      );

    finalScore.innerHTML = `

      <h2>
        Quiz Completed 🎉
      </h2>

      <p>
        Score:
        <strong>
          ${score}
        </strong>
        /
        <strong>
          ${filteredData.length}
        </strong>
      </p>

      <p>
        ${percentage}%
      </p>

      <button
        class="retry-btn"
        id="final-retry-btn"
        style="
          display:inline-block;
          margin-top:20px;
        "
      >
        Try Again
      </button>

    `;

    document
      .getElementById(
        "final-retry-btn"
      )
      .addEventListener(
        "click",
        restartQuiz
      );

    return;
  }

  questionCounter.innerHTML = `
    Question
    ${currentQuestion + 1}
    /
    ${filteredData.length}
  `;

  questionText.innerHTML =
    question.question;

  translationText.innerHTML =
    question.translation;

  choicesContainer.innerHTML = "";

  question.choices.forEach(
    (choice, index) => {

      const button =
        document.createElement("button");

      button.classList.add(
        "choice-btn"
      );

      button.innerHTML = choice;

      button.onclick = () =>
        checkAnswer(index);

      choicesContainer
        .appendChild(button);

    }
  );
}

// ========================================
// CHECK ANSWER
// ========================================

function checkAnswer(selected) {

  if (answered) return;

  answered = true;

  const question =
    filteredData[currentQuestion];

  const buttons =
    document.querySelectorAll(
      ".choice-btn"
    );

  buttons.forEach(
    (btn, index) => {

      btn.disabled = true;

      if (index === question.correct) {

        btn.style.background =
          "#2ecc71";

      } else if (
        index === selected
      ) {

        btn.style.background =
          "#e74c3c";
      }

    }
  );

  if (selected === question.correct) {

    score++;

    feedback.innerHTML =
      "✅ Correct!";

    feedback.style.color =
      "green";

  } else {

    feedback.innerHTML =
      "❌ Incorrect!";

    feedback.style.color =
      "red";
  }

  nextBtn.style.display =
    "inline-block";
}

// ========================================
// NEXT QUESTION
// ========================================

nextBtn.addEventListener(
  "click",
  () => {

    currentQuestion++;

    renderQuestion();

  }
);

// ========================================
// RESTART QUIZ
// ========================================

function restartQuiz() {

  currentQuestion = 0;

  score = 0;

  answered = false;

  finalScore.style.display =
    "none";

  quizCard.style.display =
    "block";

  renderQuestion();
}

// ========================================
// SEARCH + FILTER
// ========================================

function applyFilters() {

  const searchTerm =
    document
      .getElementById(
        "search-input"
      )
      .value
      .toLowerCase();

  const category =
    document
      .getElementById(
        "filter-select"
      )
      .value;

  filteredData =
    quizData.filter((quiz) => {

      const matchesSearch =
        quiz.question
          .toLowerCase()
          .includes(searchTerm);

      const matchesCategory =
        category === "all" ||
        quiz.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );

    });

  currentQuestion = 0;

  score = 0;

  quizCard.style.display =
    "block";

  finalScore.style.display =
    "none";

  renderQuestion();
}

document
  .getElementById(
    "search-input"
  )
  .addEventListener(
    "input",
    applyFilters
  );

document
  .getElementById(
    "filter-select"
  )
  .addEventListener(
    "change",
    applyFilters
  );

// ========================================
// INITIAL LOAD
// ========================================

renderQuestion();