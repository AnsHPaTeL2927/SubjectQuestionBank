const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    const jwtToken = token.replace("Bearer", "").trim()
    console.log("Token from auth middleware", jwtToken)

    jwt.verify(jwtToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log(`Error comes in authenticate middleware: ${err}`)
            return res.status(403).json({ 
                success: false,    
                message: 'Failed to authenticate token' 
            });
        }

        req.user = decoded;
        console.log("authenticate user", req.user)
        next();
    });
};

module.exports = authenticate;
