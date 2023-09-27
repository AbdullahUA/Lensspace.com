const { name } = require("ejs");
  const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const accountSid = "AC864c7fe9a3d2d021ed48e32d129e9e23";
const authToken = "718e34e69eaa396908817e4da98b7cfc";
const verifySid = "VA416322cca17d99e2751157998a3eaf3c";
const client = require("twilio")(accountSid, authToken);
const otpHelper = require('../helpers/otpHelper')


const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const home = async (req, res) => {
  try {
    
      const product = await Product.find({}) 
        const category = await Category.find({ })
      return res.render("public/home.ejs",{products:product, category}); 
      
    }
    
   catch (error) {
    console.log(error.message);
  }
};



const login = async (req, res) => {
  try {
    console.log("/user-login");
    if(req.session.user_id){
      res.render("public/home.ejs");
    }
    res.render("public/login.ejs");
  } catch (error) {
    console.log(error.message);
  }
};

const signup = async (req, res) => {
  try {
    res.render("public/signup.ejs");
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  console.log('insertUser')
  try {
    const name=req.body.name
    const mobile=req.body.mobile
    const email=req.body.email
    const password=req.body.password
    const existingUser= await User.findOne({email:email})
    if(existingUser){
      return res.render("public/signup.ejs",{message:"Email already exists"})
    }
    const spassword = await securePassword(password);
    const user = new User({
      name: name,
      mobile: mobile,
      email: email,
      password: spassword,
      

    });

    const userdata = await user.save();
    const userData = await User.findOne({mobile:mobile})
    if (userData) {
      client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${mobile}`, channel: "sms" })
        .then((verification) => console.log(verification.status))
        .then(() => {
          const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          readline.question("Please enter the OTP:", (otpCode) => {
            client.verify.v2
              .services(verifySid)
              .verificationChecks.create({ to: `+91${mobile}`, code: otpCode })
              .then((verification_check) => console.log(verification_check.status))
              console.log('verification check status')
              .then(() => readline.close());
          });
        });
      
      res.render("public/verifyOtp.ejs", { mobile: mobile });
    }
    
     else {
      throw new Error("can't save the user data");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async(req, res)=>{
  try {
    console.log("verified here1");
    const email = req.body.email
    const password = req.body.password

    const userData = await User.findOne({email:email})
    console.log(userData);
    if (userData) {
      if(userData.is_blocked){
        res.send({error:"Your Account is Blocked"})
    }else{
      const passwordMatch = await bcrypt.compare(password, userData.password)
      if(passwordMatch){
        req.session.user_id = userData._id
        req.session.username = userData.name // this assigning is for session handling as conditional rendering in ejs
        let name =userData.name
        console.log("verified here3",name);
        res.redirect("/home") 
      }else{
        res.render('public/login', {message:'Password is incorrect'})
      }}
    } else {
      res.render('public/login', {message:"Email is incorrect"})
    }

  } catch (error) {
    console.log(error.message)
  }
}

const verifyOtp = async (req, res) => {
  try {
    const otp =req.body.otp;
    console.log(otp);
     const mobile = req.body.mobile
     console.log(mobile);
      const user = await User.findOne({mobile:mobile})
      if (!user) {
          res.render('public/verifyOtp.ejs',{ message: 'Invalid Session'});
      }else{
        client.verify.v2
        .services(verifySid)
        .verificationChecks.create({to:`+91${mobile}`, code: otp})
        .then((verification_check)=>{
        console.log(verification_check.status);
        if (verification_check.status === "approved") {
          req.session.loggedIn = true;
          req.session.user_id = user;
          res.render('public/home.ejs',{});
        } else if (verification_check.status === "denied") {
          res.render('public/verifyOtp.ejs', { message: 'Incorrect OTP' });
        }
        })
      }
  } catch (error) {
      console.log(error.message)
  }
}

const resendOtp = async (req, res) => {
  const mobileNumber = req.session.mobile
  try {
    // Retrieve user data from session storage
    const userData = req.session.userData;

    if (!userData) {
      res.status(400).json({ message: 'Invalid or expired session' });
    }

    // Generate and send new OTP using Twilio
    const otp = otpHelper.generateOtp()

    req.session.otp = otp

  //   await otpHelper.sendOtp(mobileNumber,otp)
    console.log(`Resend Otp is ${otp}`)

    res.render('verifyOtp',{ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Error: ', error);
    res.render('verifyOtp',{ message: 'Failed to send otp' });
  }
}



const userLogout = async(req, res)=>{
  try {
    req.session.destroy()
    res.redirect('/login')
  } catch (error) {
    console.log(error.message)
  }
}


const loadForgotPassword=async(req,res)=>{
try {
  res.render('public/forgotPassword.ejs')
} catch (error) {
  console.log(error.message)
}
}





const loadSetNewPassword= async(req,res)=>{
  try {
    res.render('public/setNewPassword.ejs')
    
  } catch (error) {
    console.log(error.message)
  }
}




const setNewPassword = async (req ,res) => {
  try { 
    const newpw = req.body.newpassword
    const confpw = req.body.confpassword
  
    const mobile = req.session.mobile
    const email = req.session.email
  
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if(!passwordRegex.test(req.body.newpassword)){
        return res.render("public/setNewPassword.ejs", { message: "Password Should Contain atleast 8 characters,one number and a special character" });
    }
  
    if(newpw === confpw){
  
        const spassword =await securePassword(newpw)
        console.log('hello')
        const newUser = await User.updateOne({ email:email }, { $set: { password: spassword } });
        console.log('hello')
        res.redirect('/logout')
    }else{
        res.render('public/setNewPassword.ejs',{message:'Password and Confirm Password is not matching'})
    }
  }
     catch (error) {
    console.log(error.message)
  }
 
}
const displayProducts = async (req, res) => {
  try {
    const category = await Category.find({});
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit; // Calculate the number of products to skip
    const searchQuery = req.query.search || ''; // Get the search query from request query parameters
    const sortQuery = req.query.sort || 'default'; // Get the sort query from request query parameters (default value is 'default')
    const minPrice = parseFloat(req.query.minPrice); // Get the minimum price from request query parameters
    const maxPrice = parseFloat(req.query.maxPrice)


    // Build the search filter
    const searchFilter = {
      $and: [
        { isListed: true },
        { isProductListed: true },
        {
          $or: [
            { name: { $regex: new RegExp(searchQuery, 'i') } },
          ],
        },
      ],
    };
    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      searchFilter.$and.push({ price: { $gte: minPrice, $lte: maxPrice } });
    }

    let sortOption = {};
    if (sortQuery === 'price_asc' ||sortQuery === 'default' ) {
      sortOption = { price: 1 }; 
    } else if (sortQuery === 'price_desc') {
      sortOption = { price: -1 }; 
    }

    const totalProducts = await Product.countDocuments(searchFilter); // Get the total number of products matching the search query
    const totalPages = Math.ceil(totalProducts / limit); // Calculate the total number of pages

    const products = await Product.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort(sortOption)
      .populate('category');

    res.render('public/shop.ejs', { product: products, category, currentPage: page, totalPages });
  } catch (error) {
    console.log(error.message);
    res.redirect('/error-500')

  }
};
const editPassword = async (req, res) => {
  try {
    const newPass = req.body.newPassword;
    // const confPass = req.body.confPass;
    const userId = res.locals.user._id;
      const spassword = await securePassword(newPass);

      const result = await User.updateOne(
        { _id: userId },
        { $set: { password: spassword } }
      );

      res.send({status:true});
    
  } catch (error) {
    console.log(error.message);
  }
};

const editInfo = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    const { name, email, mobile } = req.body;

    const result = await User.updateOne(
      { _id: userId }, // Specify the user document to update based on the user ID
      { $set: { name, email, mobile } } // Set the new field values
    );

    res.redirect("/profileDetails");
  } catch (error) {
    console.log(error.message);
    res.redirect('/error-500')

  }
};




const categoryPage = async (req,res) =>{

  try{
      const  categoryId = req.query.id
      const category = await Category.find({ })
      const page = parseInt(req.query.page) || 1; 
      const limit = 3;
      const skip = (page - 1) * limit;
      const totalProducts = await Product.countDocuments({ category:categoryId,$and: [{ isListed: true }, { isProductListed: true }]}); // Get the total number of products
      const totalPages = Math.ceil(totalProducts / limit);
      const sortQuery = req.query.sort || 'default';

      const categories = await Category.find({ })
      let sortOption = {};
    if (sortQuery === 'price_asc' ||sortQuery === 'default' ) {
      sortOption = { price: 1 }; 
    } else if (sortQuery === 'price_desc') {
      sortOption = { price: -1 }; 
    }
       
      const product = await Product.find({ category:categoryId,$and: [{ isListed: true }, { isProductListed: true }]})
      .skip(skip)
      .sort(sortOption)
      .limit(limit)
      .populate('category')

      res.render('public/categoryShop.ejs',{product,category, currentPage: page, totalPages,categoryId })
  }
  catch(err){
      console.log('category page error',err);
      res.redirect('/error-500')

    }
}

module.exports = {
  home,
  login,
   signup,
  insertUser,
  verifyLogin,
  verifyOtp,
  resendOtp,
  userLogout,
  loadForgotPassword,
  loadSetNewPassword,
  setNewPassword,
  displayProducts,
  editPassword,
  editInfo,
  categoryPage,
};