export const sendToken =(res, user, message, statusCode=200)=>{

    const token = user.getJWTToken();

    const options = {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        httpOnly: true, // This ensures the cookie is only accessible by the web server
        sameSite: 'none', // Ensure this matches your front-end and back-end setup, especially if using cross-site requests
        secure: true // Make sure this is true only in production
    }

    res.status(statusCode).cookie("token",token,options).json({
        success: true,
        message,
        user,
    })
}