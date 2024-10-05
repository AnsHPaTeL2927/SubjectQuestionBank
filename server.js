require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")

const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET, POST, HEAD, PUT, DELETE, PATCH",
    Credential: true
}

app.use(cors(corsOptions))

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 5000

// import main route file
const routes = require("./src/routes/v1/index")
// import database configuration database file
const connectDB = require('./config/database')
const errorMiddleware = require("./src/middlewares/error/errorMiddleware")

app.get("/", (req, res) => {
    res.send("Hi, I am Live!!")
})

app.use('/api/v1', routes)

app.use(errorMiddleware)

const start = async() => {
    try {
        await connectDB(process.env.MONGODB_URL)
        app.listen(PORT, () => {
            console.log(`${PORT} Yes I am Connected!!`)
        })
    } catch (error) {
        console.log(`Error From Server.js in Starrt Function: ${error}`)
    }
}

start();
