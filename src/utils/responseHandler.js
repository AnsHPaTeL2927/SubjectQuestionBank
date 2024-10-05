const sendResponse = (res, success, message, response = null, statusCode) => {
    return res.status(statusCode).json({
        'success': success,
        'message': message,
        'response': response
    })
}

module.exports = sendResponse