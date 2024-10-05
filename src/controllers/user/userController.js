const Exam = require('../../models/examModel')
const sendResponse = require('../../utils/responseHandler')
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

module.exports = { allExams }