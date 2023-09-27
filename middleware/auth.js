// const { login } = require("../controller/userController")
const User = require("../models/userModel")




const isLogin = async (req, res, next)=>{
    try {
        if(req.session.user_id){
            const userData = await User.findById(req.session.user_id)
            if(userData && userData.is_blocked){
                delete req.session.user_id
            res.redirect("/login")
        }else{
            next()
        }
        
    }else{
        res.redirect('/login')
    }
} catch (error) {
    console.log(error.message)
}}

// const checkSession = (req,res,next) => {
//     // console.log(req.session.username,"lllll");
//     res.locals.userName = req.session.username
//     next()
// }

const checkSession = async (req, res, next) => {
    const user = await User.findById(req.session.user_id); // get the user from the database using the id stored in the session
    res.locals.user = user;
    res.locals.userName = req.session.username
    const isAuthenticated = req.session.user_id
    res.locals.isAuthenticated = isAuthenticated
    next()
}

const isLogout = async(req, res, next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/home')
        }else{
        next()}
        
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    isLogin,
    checkSession,
    isLogout
}