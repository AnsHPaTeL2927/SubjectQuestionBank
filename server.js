require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const http = require('http');
const ngrok = require('@ngrok/ngrok');

const corsOptions = {
    origin: ["http://localhost:5173",  /\.ngrok\.app$/],
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
const server = http.createServer(app);

const start = async() => {
    try {
        await connectDB(process.env.MONGODB_URL)
        
        // Start the server
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        });
        
        // Connect Ngrok
        const listener = await ngrok.connect({ 
            addr: PORT, 
            authtoken_from_env: true,
        });

        console.log(`Ngrok Tunnel Created: ${listener.url()}`)
        console.log(`Your routes are now accessible at: ${listener.url()}/api/v1/`)
    } catch (error) {
        console.error(`Error in server startup: ${error}`)
    }
}

start();