const Exam = require('../../models/examModel')
const sendResponse = require('../../utils/responseHandler')
const ExamSubjectMapping = require("../../models/examSubjectMappingModel")
const allExams = async (req, res) => {
    try {
        const exams = await Exam.where('hidden').equals(false).find();

        if(!exams.length) {
            return sendResponse(res, false, 'Exams Not Found', null, 422)
        }

        return sendResponse(res, true, 'Exams fetched successfully', exams, 200)
    } catch (error) {
        return sendResponse(res, false, 'Internal Server Error', error, 500)
    }
}

const allSubjects = async (req, res) => {
    const { examId } = req.params;

    try {
        // Find all subject mappings for the given examId where is_active is true and deletedAt is false
        const subjectMappings = await ExamSubjectMapping.find({
            exam_id: examId,
            is_active: true,
            deletedAt: false,
        }).populate('subject_id'); // Populate the subject details

        // If no subjects are found, return a 404 response
        if (!subjectMappings || subjectMappings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No linked subjects found for this exam',
            });
        }

        // Extract the subjects from the populated `subject_id` field
        const linkedSubjects = subjectMappings.map(mapping => mapping.subject_id);
        console.log(linkedSubjects)

        return res.status(200).json({
            success: true,
            subjects: linkedSubjects,
        });
    } catch (error) {
        console.error(`Error fetching linked subjects: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

module.exports = { allExams, allSubjects }