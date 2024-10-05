const mongoose = require('mongoose');
const Exam = require("../../models/examModel")
const Subject = require("../../models/subjectModel")
const ExamSubjects = require("../../models/examSubjectMappingModel");

//default and testing route
const subjectController = async (req, res) => {
    res.send("subjcts are fetched")
}

const addSubject = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { examId } = req.params

        const subjects = req.body.subjects

        if (!examId || !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(422).json({
                success: false,
                message: "Exam ID and an array of subjects are required"
            });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        const addSubjects = [];
        for (const subject of subjects) {
            const { internal_name, display_name, code, internal_code, description } = subject

            // console.log(subject)
            let existingSubject = await Subject.findOne({
                code, internal_code
            })

            if (existingSubject) {
                await session.abortTransaction();
                session.endSession();
                return res.status(422).json({
                    success: false,
                    message: "Subject is already created"
                })
            }

            let newSubject = new Subject({
                internal_name, display_name, code, internal_code, description
            })
            await newSubject.save({ session });

            addSubjects.push(newSubject)
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
        console.log(`Error from add subject controller: ${error}`)
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

const examSubjectsLink = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { examId } = req.params
        const subjectId = req.body.subject_id

        const exam = await Exam.findById(examId)

        if (!exam || exam.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Exam not found',
            });
        }

        const subject = await Subject.findById(subjectId)

        if (!subject || subject.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Subject not found',
            });
        }

        const existingLink = await ExamSubjects.findOne({
            examId: examId,
            subjectId: subjectId,
        });

        if (existingLink) {
            await session.abortTransaction();
            session.endSession();
            return res.status(422).json({
                success: false,
                message: `Subject is already linked to this exam.`,
            });
        }

        const newLink = new ExamSubjects({
            exam_id: examId,
            subject_id: subjectId,
        });
        await newLink.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: 'Subject successfully linked to exam',
            response: newLink,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(`Error from linkSubjectToExam controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

const allSubject = async (req, res) => {
    try {
        const { examId } = req.params;

        if (!examId) {
            return res.status(422).json({
                success: false,
                message: 'Exam ID is required',
            });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found',
            });
        }

        const examSubjectLinks = await ExamSubjects.find({ exam_id: examId });

        if (examSubjectLinks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No subjects are linked to this exam',
            });
        }

        // Extract subject IDs from the links
        const subjectIds = examSubjectLinks.map(link => link.subject_id);

        const subjects = await Subject.where('_id').in(subjectIds).where('deletedAt').equals(false);

        return res.status(200).json({
            success: true,
            message: "Subjects are fetched",
            response: subjects
        })
    } catch (error) {
        console.log(`Error found from addsubject in Subject controller: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

const editSubject = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { subjectId } = req.params
        const updateSubjectFields = req.body

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Subject not found',
            });
        }

        for (const key in updateSubjectFields) {
            console.log(updateSubjectFields.hasOwnProperty(key))
            if (updateSubjectFields.hasOwnProperty(key) && key !== '_id') {
                subject[key] = updateSubjectFields[key];
            }
        }

        const updatedSubject = await subject.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: 'Subject updated successfully',
            data: updatedSubject,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(`Error from editSubject controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

const deleteSubject = async (req, res) => {
    try {
        const { subjectId, examId } = req.params

        if (!subjectId) {
            return res.status(422).json({
                success: false,
                message: 'Subject ID is required',
            });
        }

        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found',
            });
        }

        if (subject.deletedAt) {
            return res.status(400).json({
                success: false,
                message: 'Subject is already marked as deleted',
            });
        }

        subject.deletedAt = true;
        await subject.save();
    } catch (error) {
        console.log(`Error from deleteSubject controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

module.exports = { subjectController, addSubject, allSubject, examSubjectsLink, editSubject, deleteSubject }