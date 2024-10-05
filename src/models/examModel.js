const { Schema, model } = require("mongoose")

const examSchema = new Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    code: {
        type: String,
        require: true,
        unique: true
    },
    exam_code: {
        type: String,
        require: false,
        unique: true
    },
    description: {
        type: String,
        require: false
    },
    // year_of_exam: {
    //     type: Number,
    //     require: true
    // },
    // date_of_exam: {
    //     type: String,
    //     require: true
    // },
    marks: {
        type: Number,
        require: true
    },
    exam_type: {
        type: String,
        require: true,
        enum: ['state', 'national', 'corporate']
    },
    mode: {
        type: String,
        require: true,
        enum: ['online', 'offline']
    },
    popular: {
        type: Boolean,
        default: false
    },
    hidden: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const exam = new model('Exams', examSchema)

module.exports = exam