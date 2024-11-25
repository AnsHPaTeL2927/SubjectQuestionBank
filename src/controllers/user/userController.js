const Exam = require('../../models/examModel');
const sendResponse = require('../../utils/responseHandler');
const ExamSubjectMapping = require("../../models/examSubjectMappingModel");
const Topic = require("../../models/topicModel");
const SubjectTopicMapping = require("../../models/subjectTopicMappingModel");
const Subject = require("../../models/subjectModel");
const Question = require("../../models/questionModel");

const allExams = async (req, res) => {
    try {
        const exams = await Exam.where('hidden').equals(false).find();

        if (!exams.length) {
            return sendResponse(res, false, 'Exams Not Found', null, 422);
        }

        return sendResponse(res, true, 'Exams fetched successfully', exams, 200);
    } catch (error) {
        return sendResponse(res, false, 'Internal Server Error', error, 500);
    }
};

const fetchLinkedSubjectsByExamId = async (req, res) => {
    try {
        const { examId } = req.params;

        if (!examId) {
            return sendResponse(res, false, 'Exam ID is required', null, 422);
        }

        const activeLinks = await ExamSubjectMapping.find({
            exam_id: examId,
            is_active: true,
            deletedAt: false,
        });

        if (!activeLinks.length) {
            return sendResponse(res, false, 'No subjects linked to given exam', null, 422);
        }

        const subjectIds = activeLinks.map(link => link.subject_id);
        const subjects = await Subject.find({
            _id: { $in: subjectIds },
            hidden: false,
            deletedAt: false,
        });

        if (!subjects.length) {
            return sendResponse(res, false, 'No subjects found for the given exam', null, 404);
        }

        return sendResponse(res, true, 'Subjects fetched successfully', subjects, 200);
    } catch (error) {
        return sendResponse(res, false, 'Internal Server Error', error, 500);
    }
};

const fetchLinkedTopicsBySubjectId = async (req, res) => {
    try {
        const { subjectId } = req.params;

        if (!subjectId) {
            return sendResponse(res, false, 'Subject ID is required', null, 400);
        }

        const activeLinks = await SubjectTopicMapping.find({
            subject_id: subjectId,
            is_active: true,
            deletedAt: false,
        });

        if (!activeLinks.length) {
            return sendResponse(res, false, 'No topics linked to the given subject', null, 404);
        }

        const topicIds = activeLinks.map(link => link.topic_id);
        const topics = await Topic.find({
            _id: { $in: topicIds },
            hidden: false,
            deletedAt: false,
        });

        if (!topics.length) {
            return sendResponse(res, false, 'No visible topics found for the given subject', null, 404);
        }

        return sendResponse(res, true, 'Topics fetched successfully', topics, 200);
    } catch (error) {
        return sendResponse(res, false, 'Internal Server Error', error, 500);
    }
};

const fetchQuestionsByTopicId = async (req, res) => {
    try {
        const { examId, subjectId, topicId } = req.params;

        if (!examId || !subjectId || !topicId) {
            return sendResponse(
                res,
                false,
                !examId
                    ? 'examId is required'
                    : !subjectId
                        ? 'subjectId is required'
                        : 'topicId is required',
                null,
                400
            );
        }

        const exam = await Exam.findById(examId);
        const subject = await Subject.findById(subjectId);
        const topic = await Topic.findById(topicId);

        if (!exam || !subject || !topic) {
            return sendResponse(
                res,
                false,
                !exam
                    ? 'Exam not found'
                    : !subject
                        ? 'Subject not found'
                        : 'Topic not found',
                null,
                400
            );
        }

        const questions = await Question.find({
            topic_id: topicId,
            hidden: false,
            deletedAt: false,
        });

        if (!questions.length) {
            return sendResponse(res, false, 'No questions found for the given topic', null, 404);
        }

        return sendResponse(res, true, 'Questions fetched successfully', questions, 200);
    } catch (error) {
        console.error(`Error in fetchQuestionsByTopicId controller: ${error}`);
        return sendResponse(res, false, 'Internal Server Error', error, 500);
    }
};

const getExamDetails = async (req, res) => {
    try {
        const { examId } = req.params;

        if (!examId) {
            return sendResponse(res, false, 'Exam ID is required', null, 400);
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            return sendResponse(res, false, 'Exam not found', null, 404);
        }

        const subjectLinks = await ExamSubjectMapping.find({
            exam_id: examId,
            is_active: true,
            deletedAt: false,
        });

        const subjectIds = subjectLinks.map(link => link.subject_id);
        const subjects = await Subject.find({
            _id: { $in: subjectIds },
            hidden: false,
            deletedAt: false,
        });

        const subjectWithTopics = await Promise.all(
            subjects.map(async subject => {
                const topicLinks = await SubjectTopicMapping.find({
                    subject_id: subject._id,
                    is_active: true,
                    deletedAt: false,
                });

                const topicIds = topicLinks.map(link => link.topic_id);
                const topics = await Topic.find({
                    _id: { $in: topicIds },
                    hidden: false,
                    deletedAt: false,
                });

                return {
                    subject,
                    topics,
                };
            })
        );

        return sendResponse(res, true, 'Exam details fetched successfully', { exam, subjects: subjectWithTopics }, 200);
    } catch (error) {
        return sendResponse(res, false, 'Internal Server Error', error, 500);
    }
};

const getSubjectDetails = async (req, res) => {
    try {
        const { subjectId } = req.params;

        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return sendResponse(res, false, 'Subject not found', null, 404);
        }

        const topicLinks = await SubjectTopicMapping.find({
            subject_id: subjectId,
            is_active: true,
            deletedAt: false,
        });

        const topicIds = topicLinks.map((link) => link.topic_id);

        const topics = await Topic.find({
            _id: { $in: topicIds },
            hidden: false,
            deletedAt: false,
        });

        return sendResponse(res, true, 'Subject details fetched successfully', { subject, topics }, 200);
    } catch (error) {
        return sendResponse(res, false, 'Internal Server Error', error, 500);
    }
};

const getTopicDetail = async (req, res) => {
    try {
        const { topicId } = req.params;

        const topic = await Topic.findById(topicId);

        if (!topic) {
            return sendResponse(res, false, 'Topic not found', null, 404);
        }

        const questions = await Question.find({
            topic_id: topicId,
            hidden: false,
            deletedAt: false,
        });

        return sendResponse(res, true, 'Topic details fetched successfully', { topic, questions }, 200);
    } catch (error) {
        console.error(`Error in getTopicDetail controller: ${error}`);
        return sendResponse(res, false, 'Internal Server Error', error, 500);
    }
};

module.exports = {
    allExams,
    fetchLinkedSubjectsByExamId,
    fetchLinkedTopicsBySubjectId,
    fetchQuestionsByTopicId,
    getExamDetails,
    getSubjectDetails,
    getTopicDetail,
};
