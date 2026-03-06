const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        test_session_id: {
            type: String,
            required: true,
            index: true
        },
        subject: {
            type: String,
            required: true
        },
        terminationLevel: {
            type: Number,
            required: true,
            default: 1
        },
        weak_topics: {
            type: [String],
            default: []
        },
        week_plan: [
            {
                day: {
                    type: String,
                    required: true
                },
                tasks: [
                    {
                        type: {
                            type: String,
                            enum: ["concept_revision", "practice", "mini_test"],
                            required: true
                        },
                        topic: String,
                        difficulty: {
                            type: String,
                            enum: ["easy", "medium", "hard"]
                        },
                        question_count: Number,
                        duration: {
                            type: String,
                            required: true
                        },
                        completed: {
                            type: Boolean,
                            default: false
                        }
                    }
                ]
            }
        ],
        summary: {
            total_topics: { type: Number, default: 0 },
            weak_topics: [
                {
                    topic: String,
                    mastery: Number,
                    priority: String
                }
            ],
            total_practice_questions: { type: Number, default: 0 },
            total_study_hours: { type: Number, default: 0 },
            goal: String
        },
        revision_schedule: [
            {
                chapter: { type: String, required: true },
                subject: { type: String, required: true },
                next_revision_date: { type: Date, required: true },
                interval_days: { type: Number, default: 3 },
                completed_count: { type: Number, default: 0 }
            }
        ]
    },
    {
        timestamps: true
    }
);

// Index for quick retrieval of user's latest roadmap
roadmapSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('Roadmap', roadmapSchema);
