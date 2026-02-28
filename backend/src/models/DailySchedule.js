const mongoose = require('mongoose');

const dailyScheduleSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        date: {
            type: Date,
            required: true,
            index: true
        },
        total_duration_minutes: {
            type: Number,
            default: 360 // 6 hours
        },
        tasks: [
            {
                task_id: {
                    type: String,
                    required: true
                },
                type: {
                    type: String,
                    enum: ["concept_revision", "practice", "mini_test", "break"],
                    required: true
                },
                subject: String,
                topic: String,
                duration_minutes: {
                    type: Number,
                    required: true
                },
                status: {
                    type: String,
                    enum: ["pending", "completed"],
                    default: "pending"
                },
                completed_at: Date,
                difficulty: String,
                importance: Number
            }
        ],
        completion_percentage: {
            type: Number,
            default: 0
        },
        is_regenerated: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Compound index for user and date
dailyScheduleSchema.index({ user_id: 1, date: 1 }, { unique: true });

// Middleware to calculate completion percentage before saving
dailyScheduleSchema.pre('save', function (next) {
    if (this.tasks && this.tasks.length > 0) {
        const completedTasks = this.tasks.filter(t => t.status === 'completed' && t.type !== 'break').length;
        const relevantTasks = this.tasks.filter(t => t.type !== 'break').length;
        this.completion_percentage = relevantTasks > 0 ? (completedTasks / relevantTasks) * 100 : 0;
    }
    next();
});

module.exports = mongoose.model('DailySchedule', dailyScheduleSchema);
