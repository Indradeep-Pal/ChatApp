const notFound = (req,res,next)=>{
    const error = new Error(`Error 404 ! Not Found --- ${req.OriginalUrl}`)
    res.status(404);
    next(error);
}

const ErrorHandler=(err,req,res,next)=>{
    const statusCode = res.statusCode === 200? 500:res.statusCode;
    res.json({
        message : err.message,
        stack : process.env.NODE_ENV === "production" ? null : err.stack
    })
}

module.exports = {notFound,ErrorHandler}