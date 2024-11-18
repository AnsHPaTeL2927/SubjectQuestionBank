const express  = require("express")
const router = express.Router()
const topicController = require("../../controllers/topic/topicController")
const authenticate = require("../../middlewares/authenticateMiddleware")

router.route("/:examId/subjects/:subjectId/add-topics").post(authenticate, topicController.addTopic)

router.route("/:examId/subjects/:subjectId/topics").post(authenticate, topicController.subjectTopicsLink)



module.exports = router