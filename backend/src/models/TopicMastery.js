const mongoose = require('mongoose');

const topicMasterySchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
        },
        topic: {
            type: String,
            required: [true, 'Topic is required'],
            trim: true
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
            index: true
        },
        mastery_percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 0
        },
        mastery_score: {
            type: Number,
            required: true,
            min: 0,
            max: 1,
            default: 0
        },
        total_weight_attempted: {
            type: Number,
            default: 0
        },
        total_weight_correct: {
            type: Number,
            default: 0
        },
        attempts: {
            type: Number,
            default: 0
        },
        last_attempt_date: {
            type: Date,
            default: Date.now
        },
        classification: {
            type: String,
            enum: ['weak', 'moderate', 'strong', 'insufficient_data'],
            default: 'insufficient_data'
        }
    },
    {
        timestamps: true
    }
);

// Compound unique index - one mastery record per user-topic-subject triple
topicMasterySchema.index({ user_id: 1, topic: 1, subject: 1 }, { unique: true });
topicMasterySchema.index({ user_id: 1, mastery_score: 1 }); // For finding weak topics
topicMasterySchema.index({ user_id: 1, classification: 1 });

const config = require('../config/abilityConfig');

// Method to update mastery score
topicMasterySchema.methods.updateMastery = async function (isCorrect, difficulty) {
    // Difficulty map from config or defaults
    const diffWeights = config.TEST_CONSTANTS.DIFFICULTY_WEIGHTS;

    let weight = diffWeights.medium;
    if (difficulty === 'easy' || difficulty <= 0.4) weight = diffWeights.easy;
    else if (difficulty === 'hard' || difficulty >= 0.7) weight = diffWeights.hard;

    // Apply recency decay before adding new data
    this.applyRecencyDecay();

    this.attempts += 1;
    this.total_weight_attempted += weight;

    if (isCorrect) {
        this.total_weight_correct += weight;
    }

    // Recalculate mastery percentage (0-100)
    // Formula: (total_correct_weight / total_weight) * 100
    if (this.total_weight_attempted > 0) {
        this.mastery_score = this.total_weight_correct / this.total_weight_attempted;
        this.mastery_percentage = this.mastery_score * 100;
    }

    // Update classification
    this.classification = this.classifyMastery();
    this.last_attempt_date = new Date();

    return this.save();
};

// Method to apply recency decay
topicMasterySchema.methods.applyRecencyDecay = function () {
    const now = new Date();
    const daysSinceLast = Math.floor((now - this.last_attempt_date) / (1000 * 60 * 60 * 24));

    if (daysSinceLast > 0) {
        const decayPerDay = config.TEST_CONSTANTS.RECENCY_DECAY_RATE;
        const decayFactor = Math.pow(1 - decayPerDay, daysSinceLast);

        // Decay the weights (simulating that old data matters less)
        this.total_weight_attempted *= decayFactor;
        this.total_weight_correct *= decayFactor;
    }
};

// Method to classify mastery level
topicMasterySchema.methods.classifyMastery = function () {
    const { MASTERY_THRESHOLDS } = config;
    // Check for Weak performance
    // If accuracy is extremely low (< 25%), it's weak even with few attempts
    if (this.attempts >= 1 && (this.mastery_score < 0.25)) {
        return 'weak';
    }

    if (this.attempts < MASTERY_THRESHOLDS.INSUFFICIENT_DATA) {
        return 'insufficient_data';
    }

    if (this.mastery_score < MASTERY_THRESHOLDS.WEAK_EASY_ACCURACY) {
        return 'weak';
    }

    if (this.mastery_score < MASTERY_THRESHOLDS.STRONG) {
        return 'moderate';
    }

    return 'strong';
};

// Static method to get weak topics for a user
topicMasterySchema.statics.getWeakTopics = function (userId, limit = 5) {
    return this.find({
        user_id: userId,
        classification: 'weak'
    })
        .sort({ mastery_percentage: 1 })
        .limit(limit);
};

// Static method to get all topics for a user
topicMasterySchema.statics.getUserMastery = function (userId) {
    return this.find({ user_id: userId })
        .sort({ mastery_percentage: -1 });
};

// Static method to update or create mastery
topicMasterySchema.statics.updateOrCreate = async function (userId, topic, subject, isCorrect, difficulty) {
    let mastery = await this.findOne({ user_id: userId, topic: topic, subject: subject });

    if (!mastery) {
        mastery = new this({
            user_id: userId,
            topic: topic,
            subject: subject
        });
    }

    await mastery.updateMastery(isCorrect, difficulty);
    return mastery;
};

module.exports = mongoose.model('TopicMastery', topicMasterySchema);
