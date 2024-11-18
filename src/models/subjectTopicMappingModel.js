const { Schema, model } = require("mongoose");
const { boolean } = require("zod");

const subjectTopicMappingSchema = new Schema({
    subject_id: {
        type: Schema.Types.ObjectId,
        ref: 'Subjects',
        required: true
    },
    topic_id: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
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

const SubjectTopicMapping = model('SubjectTopic', subjectTopicMappingSchema);

module.exports = SubjectTopicMapping;