const Exam = require("../../models/examModel")
const ExamSubjectMapping = require("../../models/examSubjectMappingModel")
const Subject = require("../../models/subjectModel")
const SubjectTopicMapping = require("../../models/subjectTopicMappingModel")
const Topic = require("../../models/topicModel")

const examController = async (req, res) => {
    res.send("exams are fetched")
}

const addExam = async (req, res) => {
    try {
        const { name, code, exam_code, description, marks, exam_type, mode } = req.body

        const examExist = await Exam.findOne({ name })

        if (examExist) {
            return res.status(400).json({
                success: false,
                message: "Exam is already Exist"
            })
        }

        const examCreated = await Exam.create({
            name,
            code,
            exam_code,
            description,
            marks,
            exam_type,
            mode
        })

        return res.status(200).json({
            success: true,
            message: "Add Exam Successfully",
            response: examCreated
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            response: error
        })
    }
}

const editExam = async (req, res) => {
    try {
        console.log("edit payload", req.body)
        const { examId } = req.params
        const { name, code, exam_code, description, marks, exam_type, mode, popular, hidden } = req.body
        const exam = await Exam.findById(examId)

        if (!exam) {
            return res.status(422).json({
                success : false,
                message : "Please Try Again!!"
            })
        }
        exam.name = name || exam.name;
        exam.code = code || exam.code;
        exam.exam_code = exam_code || exam.exam_code;
        exam.description = description || exam.description;
        exam.marks = marks || exam.marks;
        exam.type = exam_type || exam.type;
        exam.mode = mode || exam.mode;
        exam.popular = popular !== undefined ? popular : exam.popular;
        exam.hidden = hidden !== undefined ? hidden : exam.hidden;

        const updatedExam = await exam.save();

        return res.status(200).json({
            success: true,
            message: "Exam updated successfully",
            exam: updatedExam
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            response: error
        })
    }
}

const allExam = async (req, res) => {
    try {
        const exams = await Exam.find()

        if (!exams.length) {
            return res.status(404).json({
                success: false,
                message: "Exams Not Found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Exams fetch successfully",
            response: exams
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            response: error
        })
    }
}

const deleteExam = async(req, res) => {
    try {
        const { examId } = req.params

        const exam = await Exam.findById(examId)

        if(!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            })
        }

        await Exam.findByIdAndDelete(examId)

        return res.status(200).json({
            success: true,
            message: "Exam Deleted Successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            response: error
        })
    }
}

const getExamDetails = async(req, res) => {
    const { examId } = req.params
    try {
        if (!examId) {
            return res.status(422).json({
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
            deletedAt: false,
        });

        const subjectIds = subjectLinks.map((link) => link.subject_id);

        const subjects = await Subject.find({
            _id: { $in: subjectIds },
            deletedAt: false,
        });

        // Step 4: Fetch topics for each subject
        const subjectWithTopics = await Promise.all(
            subjects.map(async (subject) => {
                const topicLinks = await SubjectTopicMapping.find({
                    subject_id: subject._id,
                    deletedAt: false,
                });

                const topicIds = topicLinks.map((link) => link.topic_id);

                const topics = await Topic.find({
                    _id: { $in: topicIds },
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
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            response: error
        });
    }
}

module.exports = { examController, addExam, editExam, allExam, deleteExam, getExamDetails }