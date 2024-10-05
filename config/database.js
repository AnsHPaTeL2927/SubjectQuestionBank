const mongoose = require("mongoose")

uri = process.env.MONGODB_URL

const connectDB = () => {
    console.log("Connect Database Successfully")
    return mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
}

module.exports = connectDB