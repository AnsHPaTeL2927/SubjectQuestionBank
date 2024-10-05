const express = require("express")
const router = express.Router()
const adminController = require("../../controllers/auth/adminController")
const {registerSchema, loginSchema} = require("../../validators/authValidate")
const validate = require("../../middlewares/validation/validateMiddleware")
const authMiddleware = require("../../middlewares/auth/authMiddleware")

//by default and testing route
router.route("/auth").get(adminController.adminController)

router.route("/register").post(validate(registerSchema), adminController.adminRegister);

router.route("/login").post(validate(loginSchema), adminController.adminLogin)

router.route("/get-admin").get(authMiddleware, adminController.authAdmin)

module.exports = router