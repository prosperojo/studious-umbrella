const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName("choice-text"));
const questionCounterText = document.getElementById("questionCounter");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const loader = document.getElementById('loader');
const game = document.getElementById('game');

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuesions = [];

let questions = [];
fetch("https://opentdb.com/api.php?amount=20&category=9&type=multiple")
    .then(res => {
        return res.json();
    })
    .then((loadedQuestions) => {
        questions = loadedQuestions.results.map(loadedQuestion => {
            const formattedQuestion = {
                question: loadedQuestion.question,
            };
            const answerChoices = [...loadedQuestion.incorrect_answers];
            formattedQuestion.answer = Math.floor(Math.random() * 3 + 1);
            answerChoices.splice(formattedQuestion.answer - 1, 0, loadedQuestion.correct_answer);
            answerChoices.forEach((choice, index) => {
                formattedQuestion['choice' + (index + 1)] = choice;
            });
            return formattedQuestion;
        });
        
        startGame()
    })
    .catch((err) => {
        console.error(err);
    });

//CONSTANTS
const CORRECT_BONUS = 5;
const MAX_QUESTIONS = 20;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuesions = [...questions];
    getNewQuestion();
    game.classList.remove("hidden");
    loader.classList.add("hidden");
};

getNewQuestion = () => {
    if (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score);
        return window.location.assign('/end.html');
    }
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
    //Updates the progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    const questionIndex = Math.floor(Math.random() * availableQuesions.length);
    currentQuestion = availableQuesions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach((choice) => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });

    availableQuesions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

choices.forEach((choice) => {
    choice.addEventListener('click', (e) => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];

        const classToApply =
            selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

        if (classToApply === "correct") {
            incrementScore(CORRECT_BONUS);
        }

        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
        }, 1000);
    });
});

incrementScore = num => {
    score += num;
    scoreText.innerText = score;
};

let timeLeft = 300; // 300 seconds (5 minutes)
const timerDisplay = document.getElementById("timer");

function updateTimer() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Start countdown
const countdown = setInterval(() => {
    if (timeLeft > 0) {
        timeLeft--;
        updateTimer();
    } else {
        clearInterval(countdown);
        endQuiz();
    }
}, 1000);

function endQuiz() {
    window.location.href = "end.html";
}

// Initialize timer display when the page loads
updateTimer();