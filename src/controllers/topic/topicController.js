const mongoose = require('mongoose');
const Exam = require("../../models/examModel")
const Subject = require("../../models/subjectModel")
const Topic = require("../../models/topicModel")
const SubjectTopicMapping = require("../../models/subjectTopicMappingModel");

const addTopic = async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { examId, subjectId } = req.params

        const topics = req.body

        const exam = await Exam.findById(examId);
        const subject = await Subject.findById(subjectId)

        if (!exam || !subject) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: !exam ? "Exam not found" : "Subject not found"
            });
        }

        const addTopic = [];
        for(const topic of topics) {
            const { internal_name, display_name, code, internal_code, description, notes, popular, hidden, deletedAt } = topic

            let existingTopic = await Topic.findOne({
                code, internal_code
            })

            if (existingTopic) {
                await session.abortTransaction();
                session.endSession();
                return res.status(422).json({
                    success: false,
                    message: "Subject is already created"
                })
            }
            
            let newTopic = new Topic({
                internal_name, display_name, code, internal_code, description, notes, popular, hidden, deletedAt
            })
            await newTopic.save({ session });

            addTopic.push(newTopic)
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Subject is created successfully",
            response: addSubjects
        })        
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(`Error from add Topic controller: ${error}`)
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

const subjectTopicsLink = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { subjectId } = req.params;
        const linkedTopicIds = req.body.linked_topic_ids;
        const unlinkedTopicIds = req.body.unlinked_topic_ids;

        const subjectExists = await Subject.findById(subjectId);
        if (!subjectExists) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Subject not found',
            });
        }

        // Link topics
        for (const topicId of linkedTopicIds) {
            const existingLink = await SubjectTopicMapping.findOne({
                subject_id: subjectId,
                topic_id: topicId,
                deletedAt: false
            });

            if (!existingLink) {
                // Create new mapping if it doesn't exist
                const newLink = new SubjectTopicMapping({
                    subject_id: subjectId,
                    topic_id: topicId,
                    is_active: true
                });
                await newLink.save({ session });
            } else if (!existingLink.is_active) {
                // Activate link if it exists but is not active
                existingLink.is_active = true;
                await existingLink.save({ session });
            }
        }

        // Unlink subjects
        for (const topicId of unlinkedTopicIds) {
            const existingLink = await SubjectTopicMapping.findOne({
                subject_id: subjectId,
                topic_id: topicId,
                deletedAt: false
            });

            if (existingLink && existingLink.is_active) {
                // Soft delete the link by setting `is_active` to false
                existingLink.is_active = false;
                existingLink.deletedAt = true;
                await existingLink.save({ session });
            }
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: 'Topics successfully linked/unlinked to subject',
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(`Error in examSubjectsLink controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

module.exports = { addTopic, subjectTopicsLink }