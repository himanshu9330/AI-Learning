const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
        },
        question_id: {
            type: String,
            required: [true, 'Question ID is required'],
            index: true
        },
        test_id: {
            type: String,
            required: [true, 'Test ID is required'],
            index: true
        },
        selected_option: {
            type: String,
            required: [true, 'Selected option is required']
        },
        correct: {
            type: Boolean,
            required: true
        },
        response_time_ms: {
            type: Number,
            required: [true, 'Response time is required'],
            min: 0
        },
        topic_tags: {
            type: [String],
            default: []
        },
        difficulty: {
            type: Number,
            required: true,
            min: 0,
            max: 1
        },
        ability_at_time: {
            type: Number,
            required: true,
            min: 0,
            max: 1
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for efficient queries
answerSchema.index({ user_id: 1, createdAt: -1 }); // User answer history
answerSchema.index({ user_id: 1, question_id: 1 }); // Check if user answered question
answerSchema.index({ test_id: 1 }); // All answers for a test
answerSchema.index({ user_id: 1, topic_tags: 1 }); // Topic-based queries

// Static method to get user's answer history
answerSchema.statics.getUserHistory = function (userId, limit = 50) {
    return this.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static method to get topic-specific answers
answerSchema.statics.getTopicAnswers = function (userId, topic) {
    return this.find({
        user_id: userId,
        topic_tags: topic
    });
};

// Static method to calculate accuracy for a user
answerSchema.statics.calculateAccuracy = async function (userId) {
    const result = await this.aggregate([
        { $match: { user_id: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                correct: { $sum: { $cond: ['$correct', 1, 0] } }
            }
        }
    ]);

    if (result.length === 0) return 0;
    return (result[0].correct / result[0].total) * 100;
};

module.exports = mongoose.model('Answer', answerSchema);
