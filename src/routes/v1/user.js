const express = require('express')
const router = express.Router()
const userController = require("../../controllers/user/userController")

router.route("/exams").get(userController.allExams)

router.route("/exams/:examId/subjects").get(userController.fetchLinkedSubjectsByExamId)

router.route("/exams/:examId/subjects/:subjectId/topics").get(userController.fetchLinkedTopicsBySubjectId)

router.route("/exams/:examId/subjects/:subjectId/topics/:topicId/questions").get(userController.fetchQuestionsByTopicId)

router.route("/exams/:examId").get(userController.getExamDetails)

router.route("/subjects/:subjectId").get(userController.getSubjectDetails)

router.route("/topics/:topicId").get(userController.getTopicDetail)

module.exports = router;