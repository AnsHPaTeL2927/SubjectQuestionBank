const express = require("express")
const router = express.Router()
const subjectController = require("../../controllers/Subject/subjectController")
const authenticate = require('../../middlewares/authenticateMiddleware')

router.route("/subject").get(subjectController.subjectController)

router.route("/:examId/subjects/add-subject").post(authenticate, subjectController.addSubject)

router.route('/:examId/subjects/:subjectId').put(authenticate, subjectController.editSubject)

router.route("/:examId/subjects").get(authenticate, subjectController.allSubject);

router.route("/:examId/subjects").post(authenticate, subjectController.examSubjectsLink);

router.route("/:examId/subjects/:subjectId").delete(authenticate, subjectController.deleteSubject)

router.route("/:examId/subjects/:subjectId").get(authenticate, subjectController.getSubjectDetails)

//user route
// router.route("/:examId/subjects").get(subjectController.allSubject);

module.exports = router