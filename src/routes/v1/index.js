const express = require('express')
const router = express.Router()

// Import All Route Modules
const examRoutes = require("./exam")
const adminRoutes = require("./admin")
const subjectRoutes = require("./subject")
const userRouter = require("./user")
const topicRouter = require("./topic")

// Define route paths
router.use('/admin', adminRoutes)
router.use('/exams', examRoutes)
router.use('/exams', subjectRoutes)
router.use('/user', userRouter)
router.use('/exams', topicRouter)

module.exports = router