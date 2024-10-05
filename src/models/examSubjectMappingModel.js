const { Schema, model } = require("mongoose");
const { boolean } = require("zod");

const examSubjectMappingSchema = new Schema({
    exam_id: {
        type: Schema.Types.ObjectId,
        ref: 'Exams',
        required: true
    },
    subject_id: {
        type: Schema.Types.ObjectId,
        ref: 'Subjects',
        required: true
    },
    is_active: {
        type: Boolean,
        default: false,
        required: true
    },
    deletedAt: {
        type: Boolean,
        default: false,
        required: false
    }
}, {
    timestamps: true
});

const ExamSubjectMapping = model('ExamSubject', examSubjectMappingSchema);

module.exports = ExamSubjectMapping;