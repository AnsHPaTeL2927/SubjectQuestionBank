const mongoose = require('mongoose');
const Exam = require("../../models/examModel")
const Subject = require("../../models/subjectModel")
const Topic = require("../../models/topicModel")
const Question = require("../../models/questionModel")
const ExamSubjectMapping = require("../../models/examSubjectMappingModel");
const SubjectTopicMapping = require("../../models/subjectTopicMappingModel");

const addQuestion = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { examId, subjectId, topicId } = req.params;
        const questions = req.body;

        const exam = await Exam.findById(examId);
        const subject = await Subject.findById(subjectId);
        const topic = await Topic.findById(topicId);

        if (!exam || !subject || !topic) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: !exam ? "Exam not found" : !subject ? "Subject not found" : "Topic not found"
            });
        }

        const addQuestion = [];
        for (const question of questions) {
            const { title, code, description, difficulty_level, marks, options, explanation, hidden } = question;

            let existingQuestion = await Question.findOne({ code });

            if (existingQuestion) {
                await session.abortTransaction();
                session.endSession();
                return res.status(422).json({
                    success: false,
                    message: "Question is already created"
                });
            }

            let newQuestion = new Question({
                title,
                code,
                description,
                difficulty_level,
                marks,
                options,
                explanation,
                topic_id: topicId, // Corrected field
                hidden
            });
            await newQuestion.save({ session });

            addQuestion.push(newQuestion);
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Question is created successfully",
            response: addQuestion
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(`Error from add Question controller: ${error}`);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const editQuestion = async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { questionId } = req.params
        const updatedQuestionField = req.body

        const question = await Question.findById(questionId)
        if (!question) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Question not found',
            });
        }

        for (const key in updatedQuestionField) {
            if (updatedQuestionField.hasOwnProperty(key) && key !== '_id') {
                question[key] = updatedQuestionField[key];
            }
        }

        const updatedQuestion = await question.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: 'Question updated successfully',
            data: updatedQuestion,
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(`Error from editQuestion controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

const deleteQuestion = async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const { questionId } = req.params
    
    try {
        const question = await Question.findById(questionId)

        if (!question) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Question not found',
            });
        }

        if (question.deletedAt) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Topic is already deleted',
            });
        }

        question.deletedAt = true;
        await question.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: 'Question was deleted successfully',
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(`Error in deleteTopic controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

const allQuestions = async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { examId, subjectId, topicId } = req.params

        const exam = await Exam.findById(examId);
        const subject = await Subject.findById(subjectId);
        const topic = await Topic.findById(topicId);

        if (!exam || !subject || !topic) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: !exam ? "Exam not found" : !subject ? "Subject not found" : "Topic not found"
            });
        }

        const questions = await Question.find({ topic_id: topicId, deletedAt: false });

        if (!questions || questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No questions found for this topic',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Questions fetched successfully',
            data: questions,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(`Error in deleteTopic controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

const getQuestionDetails = async(req, res) => {
    const { examId, subjectId, topicId, questionId } = req.params

    try {
        const exam = await Exam.findById(examId)
        const subject = await Subject.findById(subjectId)
        const topic = await Topic.findById(topicId)
        if (!exam || !subject || !topic) {
            return res.status(404).json({
                success: false,
                message: !exam ? "Exam Not Found" : !subject ? 'Subject not found' : "Topic Not Found"
            });
        }

        const question = await Question.find({
            _id: questionId,
            deletedAt: false
        })

        return res.status(200).json({
            success: true,
            message: 'Question details fetched successfully',
            data: {
                question
            }
        });
    } catch (error) {
        console.error(`Error in getQuestionDetails controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

module.exports = { addQuestion, editQuestion, deleteQuestion, allQuestions, getQuestionDetails };
