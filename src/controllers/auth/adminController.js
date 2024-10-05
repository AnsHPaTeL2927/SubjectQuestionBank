const Admin = require("../../models/adminModel")
const bcrypt = require('bcryptjs')

const adminController = async (req, res) => {
    res.send("Auth login successfully")
}

const adminLogin = async (req, res) => {
    try {
        console.log("Admin Login:", req.body)
        const { email, password } = req.body

        const adminExist = await Admin.findOne({ email })
        console.log("Admin Login:", adminExist);

        if (!adminExist) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials"
            })
        }

        const isPasswordVerified = await bcrypt.compare(password, adminExist.password);

        if (isPasswordVerified) {
            res.status(200).json({
                success: true,
                message: "Login Successfully",
                token: await adminExist.generateToken(),
                adminId: adminExist._id.toString(),
            })
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid Email and Password"
            })
        }
    } catch (error) {
        console.log(`Error from login controller: ${error}`)
        res.status(422).json({
            success: false,
            message: "Server Error"
        })
    }
}

const adminRegister = async (req, res) => {
    try {
        console.log("Register", req.body)   
        const { username, email, password, phone } = req.body

        const adminExist = await Admin.findOne({ email })

        if (adminExist) {
            return res.status(400).json({
                success: false,
                message: "Admin already Exist"
            })
        }

        const adminCreated = await Admin.create({
            username,
            email,
            password,
            phone,
        })

        res.status(200).json({
            success: true,
            message: "Registration Successfully",
            token: await adminCreated.generateToken(),
            userId: adminCreated._id.toString()
        })
    } catch (error) {
        console.log(`Error from admin register controller: ${error}`)
        res.status(422).json({
            success: false,
            message: "Server Error"
        })
    }
}

const authAdmin = async (req, res) => {
    try {
        const adminData = req.user;
        console.log(adminData)
        res.status(200).json({ 
            success: true,
            response: adminData 
        })
    } catch (error) {
        console.log(`Error From Admin Send Data Logic ${error}`)
        res.status(422).json({
            success: false,
            message: "Server Error"
        })
    }
}

module.exports = { adminController, adminLogin, adminRegister, authAdmin }