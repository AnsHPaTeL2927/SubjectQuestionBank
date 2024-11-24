const express  = require("express")
const router = express.Router()
const topicController = require("../../controllers/topic/topicController")
const authenticate = require("../../middlewares/authenticateMiddleware")

router.route("/:examId/subjects/:subjectId/add-topics").post(authenticate, topicController.addTopic)

router.route("/:examId/subjects/:subjectId/topics").post(authenticate, topicController.subjectTopicsLink)

router.route("/:examId/subjects/:subjectId/topics/:topicId").put(authenticate, topicController.editTopic)

router.route("/:examId/subjects/:subjectId/topics/:topicId").delete(authenticate, topicController.deleteTopic)

router.route("/:examId/subjects/:subjectId/topics").get(authenticate, topicController.allTopics)

module.exports = router