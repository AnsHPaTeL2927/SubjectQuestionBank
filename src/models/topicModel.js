const { Schema, model } = require('mongoose')

const topicSchema = new Schema({
    internal_name: {
        type: String,
        required: true,
        unique: true
    },
    display_name: {
        type: String,
        required: true
    },
    code: { // given by Admin
        type: String,
        required: true,
        unique: true
    },
    internal_code: { // generated code
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: false
    },
    notes: {
        type: String,
        required: true
    },
    popular: {
        type: Boolean,
        default: false
    },
    hidden: {
        type: Boolean,
        default: false
    },
    deletedAt: {  // Soft delete flag
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Topic = model('topics', topicSchema)

module.exports = Topic