const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
        },
        password: {
            type: String,
            required: false, // Changed to false for Google Auth
            minlength: [6, 'Password must be at least 6 characters'],
            select: false
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true // Allows null/undefined values to be unique
        },
        grade: {
            type: String,
            default: 'Not Specified' // Default for Google Auth users who haven't set it
        },
        target_exam: {
            type: String,
            default: 'Not Specified' // Default for Google Auth users who haven't set it
        },
        ability_score: {
            type: Number,
            default: 0.3,
            min: [0, 'Ability score cannot be less than 0'],
            max: [1, 'Ability score cannot exceed 1']
        },
        ema_ability_score: {
            type: Number,
            default: 0.3,
            min: 0,
            max: 1
        },
        streak: {
            type: Number,
            default: 0
        },
        last_active_date: {
            type: Date,
            default: null
        },
        consistency_stats: {
            daily_completion_rates: [Number], // Store last 14 days
            weekly_consistency: {
                type: Number,
                default: 0
            }
        },
        completed_topics: [
            {
                topic: String,
                subject: String,
                completed_at: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        avatar: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ ability_score: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for ability level
userSchema.virtual('ability_level').get(function () {
    if (this.ability_score < 0.3) return 'Beginner';
    if (this.ability_score < 0.6) return 'Intermediate';
    if (this.ability_score < 0.8) return 'Advanced';
    return 'Expert';
});

module.exports = mongoose.model('User', userSchema);
