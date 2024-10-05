const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const adminSchema = mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    }
})  

adminSchema.pre("save", async function (next) {
    const admin = this

    if (!admin.isModified("password")) {
        next()
    }

    try {
        const saltRound = await bcrypt.genSalt(10)
        const hash_password = await bcrypt.hash(admin.password, saltRound)
        admin.password = hash_password
    } catch (error) {
        console.log(`Error from adminSchema.pre Fucntion: ${error}`)
    }
})

adminSchema.methods.generateToken = async function () {
    try {
        return jwt.sign(
            {
                adminId: this._id.toString(),
                username: this.username,
                email: this.email
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "1d"
            }
        )
    } catch (error) {
        console.log(`Error from generateToken function ${error}`)
    }
}

const Admin = new mongoose.model("Admin", adminSchema)

module.exports = Admin;