const { Schema, model, default: mongoose } = require('mongoose');

const questionSchema = new Schema({
    title: { // The actual question text
        type: String,
        required: true
    },
    code: { // Unique code for the question
        type: String,
        required: true,
        unique: true
    },
    description: { // Additional details or context
        type: String,
        required: false
    },
    difficulty_level: { // E.g., Easy, Medium, Hard
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    marks: { // Marks assigned to the question
        type: Number,
        required: true
    },
    options: [ // Multiple choice options
        {
            _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Explicit _id for options
            text: { type: String, required: true },
            isCorrect: { type: Boolean, default: false } // Identifies the correct answer
        }
    ],
    explanation: { // Explanation of the correct answer in a structured format
        type: String,
        required: false
    },
    topic_id: { // Link to the topic this question belongs to
        type: Schema.Types.ObjectId,
        ref: 'topics',
        required: true
    },
    hidden: { // Question visibility
        type: Boolean,
        default: true
    },
    deletedAt: { // Soft delete flag
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Question = model('questions', questionSchema);

module.exports = Question;
