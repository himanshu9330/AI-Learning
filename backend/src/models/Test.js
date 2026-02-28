const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const testSchema = new mongoose.Schema(
    {
        test_id: {
            type: String,
            default: () => `TEST-${uuidv4()}`,
            unique: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
        },
        subject: {
            type: String,
            required: [true, 'Subject is required']
        },
        chapter: {
            type: String,
            default: null
        },
        topic: {
            type: String,
            default: null
        },
        start_time: {
            type: Date,
            default: Date.now
        },
        end_time: {
            type: Date,
            default: null
        },
        ability_before: {
            type: Number,
            required: true,
            min: 0,
            max: 1
        },
        ability_after: {
            type: Number,
            default: null,
            min: 0,
            max: 1
        },
        questions_attempted: {
            type: Number,
            default: 0
        },
        correct_answers: {
            type: Number,
            default: 0
        },
        final_score: {
            type: Number,
            default: null,
            min: 0,
            max: 100
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'abandoned'],
            default: 'active'
        },
        questions: [{
            question_id: String,
            difficulty: Number,
            answered: { type: Boolean, default: false },
            correct: { type: Boolean, default: false }
        }]
    },
    {
        timestamps: true
    }
);

// Indexes
testSchema.index({ test_id: 1 });
testSchema.index({ user_id: 1, createdAt: -1 }); // For user test history
testSchema.index({ status: 1 });

// Virtual for test duration
testSchema.virtual('duration_minutes').get(function () {
    if (!this.end_time) return null;
    return Math.round((this.end_time - this.start_time) / (1000 * 60));
});

// Virtual for accuracy percentage
testSchema.virtual('accuracy').get(function () {
    if (this.questions_attempted === 0) return 0;
    return Math.round((this.correct_answers / this.questions_attempted) * 100);
});

// Method to calculate final score
testSchema.methods.calculateFinalScore = function () {
    if (this.questions_attempted === 0) return 0;
    return Math.round((this.correct_answers / this.questions_attempted) * 100);
};

// Method to complete test
testSchema.methods.completeTest = function (abilityAfter) {
    this.end_time = new Date();
    this.ability_after = abilityAfter;
    this.final_score = this.calculateFinalScore();
    this.status = 'completed';
    return this.save();
};

module.exports = mongoose.model('Test', testSchema);
