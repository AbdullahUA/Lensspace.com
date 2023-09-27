
const mongoose = require ("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system")

const express = require("express")
const app = express()

const session = require('express-session');

app.use(session({
    secret: 'your-secret-key', // Replace with a secure random string
    resave: false,
    saveUninitialized: true,
}));

app.use(express.urlencoded({extended : true}))
app.use(express.json())

app.set('view engine', 'ejs')
app.set('views','./views')
// app.use('/public',express.static(path.join(__dirname,'public')))
app.use(express.static('views'))




const userRoute = require('./routes/userRoute')
app.use("/", userRoute)
const adminRoute = require('./routes/adminRoute')
app.use("/admin", adminRoute)




app.listen(3000,()=>{
    console.log("server started on 3000")
})