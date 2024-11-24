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
    
}

module.exports = { addQuestion };
