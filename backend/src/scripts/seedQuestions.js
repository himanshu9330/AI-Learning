require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const connectDB = require('../config/database');

const questions = [
    // Mathematics
    {
        question_id: 'math_001',
        subject: 'Mathematics',
        topic_tags: ['Algebra', 'Linear Equations'],
        difficulty: 0.3,
        text: 'Solve for x: 2x + 5 = 15',
        options: ['x = 5', 'x = 10', 'x = 2', 'x = 7.5'],
        correct_option: 'x = 5',
        explanation: 'Subtract 5 from both sides: 2x = 10. Divide by 2: x = 5.'
    },
    {
        question_id: 'math_002',
        subject: 'Mathematics',
        topic_tags: ['Calculus', 'Derivatives'],
        difficulty: 0.7,
        text: 'What is the derivative of x^2?',
        options: ['x', '2x', 'x^2', '2'],
        correct_option: '2x',
        explanation: 'The power rule states that d/dx(x^n) = nx^(n-1). So d/dx(x^2) = 2x.'
    },
    {
        question_id: 'math_003',
        subject: 'Mathematics',
        topic_tags: ['Geometry', 'Area'],
        difficulty: 0.4,
        text: 'What is the area of a circle with radius 3?',
        options: ['9π', '6π', '3π', '9'],
        correct_option: '9π',
        explanation: 'Area = πr^2. If r=3, Area = π(3^2) = 9π.'
    },

    // Physics
    {
        question_id: 'phy_001',
        subject: 'Physics',
        topic_tags: ['Mechanics', 'Newton\'s Laws'],
        difficulty: 0.4,
        text: 'Which law states that F = ma?',
        options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'],
        correct_option: 'Second Law',
        explanation: 'Newton\'s Second Law of Motion defines force as the product of mass and acceleration (F=ma).'
    },
    {
        question_id: 'phy_002',
        subject: 'Physics',
        topic_tags: ['Thermodynamics', 'Energy'],
        difficulty: 0.6,
        text: 'What is the SI unit of energy?',
        options: ['Watt', 'Newton', 'Joule', 'Pascal'],
        correct_option: 'Joule',
        explanation: 'The Joule (J) is the SI unit of energy.'
    },

    // Chemistry
    {
        question_id: 'chem_001',
        subject: 'Chemistry',
        topic_tags: ['Organic', 'Alkanes'],
        difficulty: 0.5,
        text: 'What is the chemical formula for Methane?',
        options: ['CH4', 'C2H6', 'CO2', 'H2O'],
        correct_option: 'CH4',
        explanation: 'Methane is the simplest alkane with one carbon atom and four hydrogen atoms.'
    },
    {
        question_id: 'chem_002',
        subject: 'Chemistry',
        topic_tags: ['Inorganic', 'Acids'],
        difficulty: 0.4,
        text: 'What is the pH of pure water at 25°C?',
        options: ['0', '7', '14', '1'],
        correct_option: '7',
        explanation: 'Pure water is neutral, so it has a pH of 7 at 25°C.'
    },

    // Biology
    {
        question_id: 'bio_001',
        subject: 'Biology',
        topic_tags: ['Cell Biology', 'Organelles'],
        difficulty: 0.4,
        text: 'Which organelle is known as the powerhouse of the cell?',
        options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus'],
        correct_option: 'Mitochondria',
        explanation: 'Mitochondria generate most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy.'
    },
    {
        question_id: 'bio_002',
        subject: 'Biology',
        topic_tags: ['Genetics', 'DNA'],
        difficulty: 0.6,
        text: 'What is the shape of DNA?',
        options: ['Single Helix', 'Double Helix', 'Linear', 'Circular'],
        correct_option: 'Double Helix',
        explanation: 'DNA consists of two strands that wind around each other to form a double helix.'
    },

    // General Knowledge
    {
        question_id: 'gk_001',
        subject: 'General Knowledge',
        topic_tags: ['Geography', 'Solar System'],
        difficulty: 0.2,
        text: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
        correct_option: 'Mars',
        explanation: 'Mars appears red because of iron oxide (rust) on its surface.'
    }
];

const seedDB = async () => {
    try {
        await connectDB();

        // Clear existing questions
        await Question.deleteMany({});
        console.log('Cleared existing questions...');

        // Insert new questions
        await Question.insertMany(questions);
        console.log(`Successfully seeded ${questions.length} questions!`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
