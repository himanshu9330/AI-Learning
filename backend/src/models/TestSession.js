const mongoose = require('mongoose');

const testSessionSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
        },
        test_id: {
            type: String,
            required: [true, 'Test ID is required'],
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
        exam: {
            type: String,
            required: [true, 'Exam type is required']
        },
        currentLevel: {
            type: Number,
            default: 1,
            min: 1
        },
        currentQuestionId: {
            type: String,
            default: null
        },
        attemptedQuestionIds: {
            type: [String],
            default: []
        },
        // Batch counters for tracking progress within a set of questions
        batchCount: {
            type: Number,
            default: 0
        },
        batchTotal: {
            type: Number,
            default: 5
        },
        batchCorrect: {
            type: Number,
            default: 0
        },
        batchIncorrect: {
            type: Number,
            default: 0
        },
        totalScore: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ['active', 'paused', 'completed', 'reset'],
            default: 'active'
        },
        last_accessed: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Update last_accessed on save
testSessionSchema.pre('save', function (next) {
    this.last_accessed = new Date();
    next();
});

// Index for performance
testSessionSchema.index({ user_id: 1, test_id: 1 }, { unique: true });
testSessionSchema.index({ user_id: 1, status: 1 });

module.exports = mongoose.model('TestSession', testSessionSchema);
