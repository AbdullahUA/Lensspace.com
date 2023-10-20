const { name } = require("ejs");
  const User = require("../models/userModel");
const bcrypt = require("bcrypt");
require('dotenv').config();
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const accountSid = process.env.TWILIO_SID
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "MG8192ae6cbd5fd91f085cad098357e14a";
const client = require("twilio")(accountSid, authToken);
const otpHelper = require('../helpers/otpHelper')
const cartHelper = require('../helpers/cartHelper')


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
        const category = await Category.find({})
        const displayedProducts = product.slice(0, 4);
      return res.render("home.ejs",{products:displayedProducts,category}); 
      
    }
    
   catch (error) {
    console.log(error.message);
    res.redirect('/error-500')
  }
};



const login = async (req, res) => {
  try {
    console.log("/user-login");
    if(req.session.user_id){
      res.render("home");
    }
    res.render("login");
  } catch (error) {
    console.log(error.message);
    res.redirect('/error-500')
  }
};

const signup = async (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error.message);
    res.redirect('/error-500')
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
      return res.render("signup",{message:"Email already exists"})
    }
    const otp = otpHelper.generateOtp()
    await otpHelper.sendOtp(mobile,otp)
    console.log(`Otp is ${otp}`)
    try {
      req.session.otp = otp;
      req.session.userData = req.body;

      req.session.mobile = mobile 
      res.render('verifyOtp')
  } catch (error) {
      console.log(error.message);
      res.redirect('/error-500')

  }
  } catch (error) {
    console.log(error.message);
    res.redirect('/error-500')
  }
};


function generateReferralCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 6;
  let referralCode = '';

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters.charAt(randomIndex);
  }

  return referralCode;
}

const verifyOtp = async (req, res) => {
  try {
    const otp =req.body.otp;
    console.log(otp);
     const sessionOTP = req.session.otp
     const userData = req.session.userData
     if (!sessionOTP || !userData) {
      res.render('verifyOtp',{ message: 'Invalid Session' });
  }else if (sessionOTP !== otp) {
      res.render('verifyOtp',{ message: 'Invalid OTP' });
  }else{
  const spassword =await securePassword(userData.password)

  let referralCode = userData.enteredReferralCode;  // Get entered referral code from the userData from session userData

    // Check if the entered referral code is valid and find the referring user
    const referringUser = await User.findOne({ referralCode: referralCode });

    if (!referralCode || referringUser) {
      // Generate a unique referral code for the user
      referralCode = generateReferralCode(); // Assuming you have a function to generate referral codes
      console.log(referralCode)
      const userReferral = {
        referredUserId: null, // The referred user hasn't signed up yet
        dateReferred: new Date(),
      };

      if (referringUser) {
        userReferral.referredUserId = referringUser._id; // Store the ID of the referring user
      }

      const user = new User({
          name:userData.name,
          mobile:userData.mobile,
          email:userData.email,
          password:spassword,
          referralCode: referralCode, // Store the user's unique referral code
          referrals: [userReferral], // Store the referral relationship
      })
      const userDataSave = await user.save()
      if (referringUser) {
        // Add referral bonuses to the wallets
        const referralBonusAmount = 50; // Adjust this amount as needed
        // Update the wallet balance for both referringUser and registerEmployee
        referringUser.wallet += referralBonusAmount;
        user.wallet += referralBonusAmount;
      
          // Create a wallet transaction object
          const walletTransaction = { 
            date:new Date(),
            type:"Credit",
            amount:referralBonusAmount,
           };

           const referringUserWalletUpdated= await User.updateOne(
            {_id:referringUser._id},
            {
              $push:{walletTransaction: walletTransaction}
            }
           )
            
           const userWalletUpdated= await User.updateOne(
            {_id:user._id},
            {
              $push:{walletTransaction: walletTransaction}
            }
           )
          

        // Save the changes to both users
        await referringUser.save();
        await user.save();
        
      }
        res.redirect('/login')
      }else{
        res.render("signup",{message:"Registration failed"})
      }
  }
} catch (error) {
  console.log(error.message)
       res.render("signup",{message:"Registration failed on referral issue"})  
  }
}


const verifyLogin = async(req, res)=>{
  try {
    console.log("verified here1");
    const email = req.body.email
    const password = req.body.password

    const userData = await User.findOne({email:email})
    console.log(userData);
    if (userData) {
      if(userData.is_blocked){
        res.redirect('/error-403')
    }else{
      const passwordMatch = await bcrypt.compare(password, userData.password)
      if(passwordMatch){
        req.session.user_id = userData._id
        req.session.username = userData.name // this assigning is for session handling as conditional rendering in ejs
        let name =userData.name
        console.log("verified here3",name);
        res.redirect("/home") 
      }else{
        res.render('login', {message:'Password is incorrect'})
      }}
    } else {
      res.render('login', {message:"Email is incorrect"})
    }

  } catch (error) {
    console.log(error.message);
    res.redirect('/error-500')
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
    res.redirect('/error-500')
  }
}


const loadForgotPassword=async(req,res)=>{
try {
  res.render('forgotPassword')
} catch (error) {
  console.log(error.message)
  res.redirect('/error-500')
}
}

const forgotPasswordemail = async(req, res)=>{  
  try {
    const user = await User.findOne({email : req.body.email})                                     
    // req.session.number = number
    if(!user){
        res.render('forgotPassword',{message:"User Not Registered"})
    }else{
        const OTP = otpHelper.generateOtp()
         await otpHelper.sendOtp(user.mobile,OTP)
        console.log(`Forgot Password otp is --- ${OTP}`) 
        req.session.otp = OTP
        req.session.email = user.email
        res.render('forgotPasswordOtp')
    }
   
    
  } catch (error) {
    console.log(error.message);
    res.redirect('/error-500')
  }     
   
}

const forgotPasswordOtpVerify = async (req,res)  => {
  try{
      const mobile = req.session.mobile
      const otp = req.session.otp
      const reqOtp = req.body.otp
      console.log(otp+"OTP"+reqOtp+"REQOTP")

      const otpHolder = await User.find({ mobile : req.body.mobile })
      if(otp==reqOtp){
          res.render('resetPassword')
      }
      else{
          res.render('forgotPasswordOtp',{message:"Your OTP was Wrong"})
      }
  }catch(error){
      console.log(error);
      res.redirect('/error-500')

  }
}



const setNewPassword = async (req ,res) => {
  try { 
    const newpw = req.body.newpassword
    const confpw = req.body.confpassword
  
    const mobile = req.session.mobile
    const email = req.session.email
  
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if(!passwordRegex.test(req.body.newpassword)){
        return res.render("resetPassword", { message: "Password should contain atleast 8 characters including one lowercase letter, one uppercase letter, one digit, and one special character" });
    }
  
    if(newpw === confpw){
  
        const spassword =await securePassword(newpw)
        console.log('hello')
        const newUser = await User.updateOne({ email:email }, { $set: { password: spassword } });
        console.log('helloooooooooooo')
        res.redirect('/logout')
    }else{
        res.render('resetPassword',{message:'Password and Confirm Password is not matching'})
    }
  }
     catch (error) {
    console.log(error.message)
    res.redirect('/error-500')
  }
 
}
const displayProducts = async (req, res) => {
  try {
    const category = await Category.find({});
    const selectedCategoryId = req.query.id || null
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
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
    if(selectedCategoryId){
      searchFilter.category = selectedCategoryId;
    }
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

    res.render('shop', { product: products, category,selectedCategoryId, currentPage: page, totalPages });
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
    console.log(userId)
      const spassword = await securePassword(newPass);

      const result = await User.updateOne(
        { _id: userId },
        { $set: { password: spassword } }
      );

      res.send({status:true});
      res.redirect("/profileDetails");
  } catch (error) {
    console.log(error.message);
    res.redirect('/error-500')
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
    res.send({status:true});
  } catch (error) {
    console.log(error.message);
    res.redirect('/error-500')

  }
};



const categoryPage = async (req,res,next) =>{
  try{
    const user = res.locals.user;

    const count = await cartHelper.getCartCount(user.id);
    const category = await Category.find({});
    const selectedCategoryId = req.query.id || null;  

    const page = parseInt(req.query.page) || 1; 
    const limit = 8;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search || ''; 
    const sortQuery = req.query.sort || 'default'; 
    const minPrice = parseFloat(req.query.minPrice); 
    const maxPrice = parseFloat(req.query.maxPrice)

    const filterCriteria = {
      $and: [
        { isListed: true },
        { isProductListed: true },
        {
          $or: [
            { name: { $regex: new RegExp(searchQuery, 'i') } },
          ]
        }] };
    if (selectedCategoryId) {
      filterCriteria.category = selectedCategoryId;
    }
    

    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      filterCriteria.$and.push({ price: { $gte: minPrice, $lte: maxPrice } });
    }

    let sortOption = {};
    if (sortQuery === 'price_asc' ||sortQuery === 'default' ) {
      sortOption = { price: 1 }; 
    } else if (sortQuery === 'price_desc') {
      sortOption = { price: -1 }; 
    }

    const totalProducts = await Product.countDocuments(filterCriteria);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(filterCriteria)
      .skip(skip) 
       
      .sort(sortOption)
      .populate('category');

      res.render('categoryShop',{ product: products,category, currentPage: page, totalPages,  selectedCategoryId, count,sortQuery })
    }
  catch(err){
    console.log('category page error', err);
    res.redirect('/error-500')
    }
}


const error404 = async(req,res)=>{
  try {
    res.render('error-404')
    
  } catch (error) {
    console.log(error.message);
    
  }
}

const error403 = async(req,res)=>{
  try {
    res.render('error-403')
    
  } catch (error) {
    console.log(error.message);
    
  }
}

const error500 = async(req,res)=>{
  try {
    res.render('error-500')
    
  } catch (error) {
    console.log(error.message);
    
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
  forgotPasswordemail,
  forgotPasswordOtpVerify,
  setNewPassword,
  displayProducts,
  editPassword,
  editInfo,
  categoryPage,
  error404,
  error403,
  error500
};