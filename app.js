const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const saltRounds = 10;

mongoose.connect('mongodb://127.0.0.1:27017/quiz_website', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    quizHistory: [{
        quizCategory: String,
        score: Number,
        date: Date
    }]
});

const User = mongoose.model('User', userSchema);

const app = express();
let port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Homepage - Display quiz categories
app.get('/', (req, res) => {
    res.render('home');
});

// Register page
app.get('/register', (req, res) => {
    res.render('register');
});

// Login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Quiz page by category
app.get('/quiz/:category', (req, res) => {
    const category = req.params.category;
    const quizQuestions = getQuizQuestions(category); // Retrieve quiz questions based on category
    res.render('quiz', { category, questions: quizQuestions });
});

// Handle quiz submission
app.post('/submitQuiz', async (req, res) => {
    const { category, answers, email } = req.body;
    const correctAnswers = getCorrectAnswers(category);
    const score = calculateScore(answers, correctAnswers);
    
    // Save the user's quiz history
    const user = await User.findOne({ email: email });
    if (user) {
        user.quizHistory.push({
            quizCategory: category,
            score: score,
            date: new Date()
        });
        await user.save();
    }

    res.render('result', { score });
});

// User registration handler
app.post('/register_in', async (req, res) => {
    let hash = await bcrypt.hash(req.body.password, saltRounds);
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hash
    });
    newUser.save()
        .then(() => {
            console.log('User added');
            res.render('login');
        })
        .catch(() => {
            console.log('User not added');
            res.render('register', { error: 'User registration failed' });
        });
});

// User login handler
app.post('/login_in', async (req, res) => {
    let data = await User.find({ email: req.body.email });
    if (data.length === 0) {
        res.render('login', { error: 'Invalid email or password' });
    } else {
        let result = await bcrypt.compare(req.body.password, data[0].password);
        if (result) {
            res.render('dashboard', { user: data[0].name });
        } else {
            res.render('login', { error: 'Invalid email or password' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

// Helper functions to get quiz questions and correct answers
function getQuizQuestions(category) {
    const quizzes = {
        'general-knowledge': [
            { question: 'Who was the first President of the United States?', options: ['George Washington', 'Thomas Jefferson', 'John Adams'], correct: 0 },
            { question: 'What is the capital of France?', options: ['Paris', 'London', 'Berlin'], correct: 0 },
            { question: 'Which planet is known as the Red Planet?', options: ['Mars', 'Jupiter', 'Venus'], correct: 0 }
        ],
        'science-nature': [
            { question: 'What is the chemical symbol for water?', options: ['H2O', 'O2', 'CO2'], correct: 0 },
            { question: 'What is the tallest type of grass?', options: ['Bamboo', 'Sugar Cane', 'Wheat'], correct: 0 },
            { question: 'What gas do plants absorb from the atmosphere?', options: ['Carbon Dioxide', 'Oxygen', 'Nitrogen'], correct: 0 }
        ],
        'entertainment': [
            { question: 'Who directed the movie "Inception"?', options: ['Christopher Nolan', 'Steven Spielberg', 'James Cameron'], correct: 0 },
            { question: 'What is the name of the famous pop singer known for the song "Bad Romance"?', options: ['Lady Gaga', 'Taylor Swift', 'Beyoncé'], correct: 0 },
            { question: 'In which year was the first "Harry Potter" movie released?', options: ['2001', '1999', '2003'], correct: 0 }
        ]
    };
    return quizzes[category];
}

function getCorrectAnswers(category) {
    const questions = getQuizQuestions(category);
    return questions.map(q => q.correct);
}

function calculateScore(answers, correctAnswers) {
    let score = 0;
    answers.forEach((answer, index) => {
        if (parseInt(answer) === correctAnswers[index]) {
            score++;
        }
    });
    return score;
}
