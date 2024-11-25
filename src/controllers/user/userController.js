const Exam = require('../../models/examModel')
const sendResponse = require('../../utils/responseHandler')
const ExamSubjectMapping = require("../../models/examSubjectMappingModel")
const Topic = require("../../models/topicModel")
const SubjectTopicMapping = require("../../models/subjectTopicMappingModel")
const Subject = require("../../models/subjectModel")
const Question = require("../../models/questionModel")
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

const fetchLinkedSubjectsByExamId = async (req, res) => {
    try {
        const { examId } = req.params;

        // Validate examId
        if (!examId) {
            return res.status(400).json({
                success: false,
                message: 'Exam ID is required',
            });
        }

        // Step 1: Find active links between the exam and subjects
        const activeLinks = await ExamSubjectMapping.find({
            exam_id: examId,
            is_active: true,
            deletedAt: false,
        });

        if (!activeLinks || activeLinks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No subjects linked to the given exam',
            });
        }

        // Extract subject IDs from the active links
        const subjectIds = activeLinks.map(link => link.subject_id);

        // Step 2: Fetch subjects based on the extracted IDs
        const subjects = await Subject.find({
            _id: { $in: subjectIds },
            hidden: false,
            deletedAt: false,
        });

        if (!subjects || subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No subjects found for the given exam',
            });
        }

        // Return the filtered subjects
        return res.status(200).json({
            success: true,
            message: 'Subjects fetched successfully',
            data: subjects,
        });
    } catch (error) {
        console.error(`Error in fetchLinkedSubjectsByExamId controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

const fetchLinkedTopicsBySubjectId = async (req, res) => {
    try {
        const { subjectId } = req.params;

        // Validate subjectId
        if (!subjectId) {
            return res.status(400).json({
                success: false,
                message: 'Subject ID is required',
            });
        }

        // Step 1: Find active links between the subject and topics
        const activeLinks = await SubjectTopicMapping.find({
            subject_id: subjectId,
            is_active: true,
            deletedAt: false,
        });


        if (!activeLinks || activeLinks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No topics linked to the given subject',
            });
        }

        // Extract topic IDs from the active links
        const topicIds = activeLinks.map(link => link.topic_id);

        // Step 2: Fetch topics based on the extracted IDs
        const topics = await Topic.find({
            _id: { $in: topicIds },
            hidden: false,
            deletedAt: false,
        });

        if (!topics || topics.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No visible topics found for the given subject',
            });
        }

        // Return the filtered topics
        return res.status(200).json({
            success: true,
            message: 'Topics fetched successfully',
            data: topics,
        });
    } catch (error) {
        console.error(`Error in allTopics controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

const fetchQuestionsByTopicId = async (req, res) => {
    try {
        const { examId, subjectId, topicId } = req.params; // Assuming they are passed as query parameters

        // Step 1: Validate required parameters
        if (!examId || !subjectId || !topicId) {
            return res.status(400).json({
                success: false,
                message: !examId ? "examId is requied" : !subjectId ? "subjectId is required" : "topicId is required",
            });
        }

        // Step 2: Validate if examId exists
        const exam = await Exam.findById(examId);
        const subject = await Subject.findById(subjectId);
        const topic = await Topic.findById(topicId);

        if (!exam || !subject || !topic) {
            return res.status(400).json({
                success: false,
                message: !exam ? "Exam not found" : !subject ? "Subject not found" : "Topic not found"
            });
        }

        // Step 5: Fetch questions linked to the given topicId
        const questions = await Question.find({
            topic_id: topicId, // Assuming `topic_id` is stored in the `questions` collection
            hidden: false,
            deletedAt: false,
        });

        if (!questions || questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No questions found for the given topic",
            });
        }

        // Step 6: Return the fetched questions
        return res.status(200).json({
            success: true,
            message: "Questions fetched successfully",
            data: questions,
        });
    } catch (error) {
        console.error(`Error in fetchQuestionsByTopicId controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getExamDetails = async (req, res) => {
    try {
        const { examId } = req.params;

        // Step 1: Validate if examId is provided
        if (!examId) {
            return res.status(400).json({
                success: false,
                message: "Exam ID is required",
            });
        }

        // Step 2: Fetch exam details
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found",
            });
        }

        // Step 3: Fetch linked subjects
        const subjectLinks = await ExamSubjectMapping.find({
            exam_id: examId,
            is_active: true,
            deletedAt: false,
        });

        const subjectIds = subjectLinks.map((link) => link.subject_id);

        const subjects = await Subject.find({
            _id: { $in: subjectIds },
            hidden: false,
            deletedAt: false,
        });

        // Step 4: Fetch topics for each subject
        const subjectWithTopics = await Promise.all(
            subjects.map(async (subject) => {
                const topicLinks = await SubjectTopicMapping.find({
                    subject_id: subject._id,
                    is_active: true,
                    deletedAt: false,
                });

                const topicIds = topicLinks.map((link) => link.topic_id);

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

        // Step 5: Return response
        return res.status(200).json({
            success: true,
            message: "Exam details fetched successfully",
            data: {
                exam,
                subjects: subjectWithTopics,
            },
        });
    } catch (error) {
        console.error(`Error in getExamDetails controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getSubjectDetails = async(req, res) => {
    const { subjectId } = req.params;

    try {
        // Fetch subject by ID
        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Step 3: Fetch linked subjects
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
       
        // Send response
        return res.status(200).json({
            success: true,
            message: 'Subject details fetched successfully',
            data: {
                subject,
                topics
            }
        });
    } catch (error) {
        console.error(`Error in getExamDetails controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

const getTopicDetail = async(req, res) => {
    const { topicId } = req.params
    try {
        const topic = await Topic.findById(topicId);

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Topic not found'
            });
        }

        const questions = await Question.find({
            topic_id: topicId,
            hidden: false,
            deletedAt: false
        })

        return res.status(200).json({
            success: true,
            message: 'Topic details fetched successfully',
            data: {
                topic,
                questions
            }
        });
        
    } catch (error) {
        console.error(`Error in getTopicDetail controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

module.exports = { allExams, fetchLinkedSubjectsByExamId, fetchLinkedTopicsBySubjectId, fetchQuestionsByTopicId, getExamDetails, getSubjectDetails, getTopicDetail }