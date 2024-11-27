const { z } = require('zod')

//create schema
const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email({ message: "Invalid email address" })
        .min(3, { message: "Email must be at least of 3 characters." })
        .max(255, { message: "Email must not be more than 255 characters." }),
    password: z
        .string({ required_error: "Password is required" })
        .max(1024, { message: "Password must not be more than 1024 characters." }),
})


const registerSchema = loginSchema.extend({
    username: z
        .string({ required_error: "Username is required" })
        .trim()
        .min(3, { message: "Username must be at least of 3 characters." })
        .max(255, { message: "Username must not be more than 255 characters." }),


    phone: z
        .string({ required_error: "Phone is required" })
        .trim()
        .min(10, { message: "Phone Number must be at least of 10 characters." })
        .max(20, { message: "Phone Number must not be more than 20 characters." }),

})


module.exports = { registerSchema, loginSchema }