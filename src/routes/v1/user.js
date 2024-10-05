const express = require('express')
const router = express.Router()
const userController = require("../../controllers/user/userController")

router.route("/exams").get(userController.allExams)

module.exports = router;