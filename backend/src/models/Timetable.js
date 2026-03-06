const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        weeklySchedule: {
            type: Map,
            of: [
                {
                    start: { type: String, required: true },
                    end: { type: String, required: true },
                    task: { type: String, required: true },
                    type: {
                        type: String,
                        enum: ['study', 'practice', 'test', 'fixed', 'break', 'extra'],
                        required: true
                    },
                    subject: { type: String }
                }
            ]
        }
    },
    {
        timestamps: true
    }
);

// Optional: ensure only one timetable per user
timetableSchema.index({ user_id: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
