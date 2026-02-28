const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        question_id: {
            type: String,
            required: [true, 'Question ID is required'],
            unique: true,
            trim: true
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true
        },
        topic_tags: {
            type: [String],
            default: [],
            index: true
        },
        difficulty: {
            type: Number,
            required: [true, 'Difficulty is required'],
            min: [0, 'Difficulty cannot be less than 0'],
            max: [1, 'Difficulty cannot exceed 1']
        },
        text: {
            type: String,
            required: [true, 'Question text is required']
        },
        options: {
            type: [String],
            required: [true, 'Options are required'],
            validate: {
                validator: function (v) {
                    return v && v.length >= 2;
                },
                message: 'At least 2 options are required'
            }
        },
        correct_option: {
            type: String,
            required: [true, 'Correct option is required'],
            validate: {
                validator: function (v) {
                    return this.options && this.options.includes(v);
                },
                message: 'Correct option must be one of the provided options'
            }
        },
        explanation: {
            type: String,
            required: [true, 'Explanation is required']
        },
        common_mistakes: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for efficient querying
questionSchema.index({ question_id: 1 });
questionSchema.index({ subject: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ subject: 1, difficulty: 1 }); // Compound index for adaptive selection

// Virtual for difficulty level
questionSchema.virtual('difficulty_level').get(function () {
    if (this.difficulty < 0.33) return 'Easy';
    if (this.difficulty < 0.67) return 'Medium';
    return 'Hard';
});

// Method to check if answer is correct
questionSchema.methods.checkAnswer = function (answer) {
    return this.correct_option === answer;
};

// Static method to find questions by difficulty range
questionSchema.statics.findByDifficultyRange = function (minDiff, maxDiff, subject = null) {
    const query = {
        difficulty: { $gte: minDiff, $lte: maxDiff }
    };

    if (subject) {
        query.subject = subject;
    }

    return this.find(query);
};

module.exports = mongoose.model('Question', questionSchema);
