const express  = require("express")
const router = express.Router()
const questionController = require("../../controllers/question/questionController")
const authenticate = require("../../middlewares/authenticateMiddleware")

router.route("/:examId/subjects/:subjectId/topics/:topicId/add-question").post(authenticate, questionController.addQuestion)

// router.route("/:examId/subjects/:subjectId/topics").post(authenticate, topicController.subjectTopicsLink)

// router.route("/:examId/subjects/:subjectId/topics/:topicId").put(authenticate, topicController.editTopic)

// router.route("/:examId/subjects/:subjectId/topics/:topicId").delete(authenticate, topicController.deleteTopic)

// router.route("/:examId/subjects/:subjectId/topics").get(authenticate, topicController.allTopics)

module.exports = router