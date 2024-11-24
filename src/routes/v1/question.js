const express  = require("express")
const router = express.Router()
const questionController = require("../../controllers/question/questionController")
const authenticate = require("../../middlewares/authenticateMiddleware")

router.route("/:examId/subjects/:subjectId/topics/:topicId/add-question").post(authenticate, questionController.addQuestion)

// router.route("/:examId/subjects/:subjectId/topics").post(authenticate, topicController.subjectTopicsLink)

router.route("/:examId/subjects/:subjectId/topics/:topicId/questions/:questionId").put(authenticate, questionController.editQuestion)

router.route("/:examId/subjects/:subjectId/topics/:topicId/questions/:questionId").delete(authenticate, questionController.deleteQuestion)

router.route("/:examId/subjects/:subjectId/topics/:topicId/questions").get(authenticate, questionController.allQuestions)

module.exports = router