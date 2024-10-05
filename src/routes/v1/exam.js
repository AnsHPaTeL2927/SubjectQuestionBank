const express = require("express")
const router = express.Router()
const examController = require("../../controllers/exam/examController")
const authenticate = require('../../middlewares/authenticateMiddleware')

router.route("/exams").get(examController.examController)

router.route("/add-exam").post(authenticate, examController.addExam)

router.route('/:examId/edit').put(authenticate, examController.editExam)

router.route("/").get(authenticate, examController.allExam);

router.route("/:examId/delete").delete(authenticate, examController.deleteExam)

module.exports = router