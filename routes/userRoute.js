const express = require('express')
const userRoute = express()
const nocache = require('nocache')
userRoute.use(nocache())
const auth = require('../middleware/auth')

 userRoute.use(auth.checkSession)
const userController = require('../controllers/userController')
const cartController = require('../controllers/cartController')
const profileController= require('../controllers/profileController')
const orderController= require('../controllers/orderController')
const productController= require('../controllers/productController')
const wishlistController= require('../controllers/wishlist')


//view engine
userRoute.set('view engine','ejs')
userRoute.set('views','./views/user')

userRoute.use(express.json());



userRoute.get('/',userController.home)
userRoute.get('/home',userController.home)
//SignUp section
userRoute.get('/signup',auth.isLogout,userController.signup)
userRoute.post('/signup',userController.insertUser)

//OTP section
userRoute.post('/verifyOtp', userController.verifyOtp)

//login section
userRoute.get('/login',auth.isLogout,userController.login)
userRoute.post('/loginValidate', userController.verifyLogin)
userRoute.get('/logout',auth.isLogin,userController.userLogout)


//Forgot Password

userRoute.get('/forgotPassword',userController.loadForgotPassword)
userRoute.post('/forgotPasswordemail',userController.forgotPasswordemail)
userRoute.post('/forgotPasswordOtp',userController.forgotPasswordOtpVerify)

//Change password  
userRoute.post('/setNewPassword',userController.setNewPassword)


//Shop
userRoute.get("/shop",auth.isLogin,userController.displayProducts)
userRoute.get('/productDetails',auth.isLogin,productController.productDetails)
userRoute.get('/categoryShop',auth.isLogin,userController.categoryPage)




//Profile
userRoute.get('/profileDetails',auth.isLogin,profileController.profileDetails)
userRoute.post('/submitAddress',auth.isLogin,profileController.submitAddress)
userRoute.post('/editAddress',auth.isLogin,profileController.editAddress)
userRoute.post('/editPassword',auth.isLogin,userController.editPassword)
userRoute.post('/editInfo',auth.isLogin,userController.editInfo)
userRoute.get('/profileAddress',auth.isLogin,profileController.profileAddress)
userRoute.get('/deleteAddress',auth.isLogin,profileController.deleteAddress)
userRoute.get('/wallet',auth.isLogin,profileController.walletTransaction)



//Cart
userRoute.get('/cart',auth.isLogin,cartController.loadCart)
userRoute.post('/addToCart/:id',auth.isLogin,cartController.addToCart)
userRoute.put('/change-product-quantity',auth.isLogin,cartController.updateQuantity)
userRoute.delete("/delete-product-cart",auth.isLogin,cartController.deleteProduct);

//Checkout
userRoute.get('/checkOut',auth.isLogin,orderController.checkOut)
userRoute.post('/checkOut',auth.isLogin,orderController.postCheckOut)
userRoute.post('/changeDefaultAddress',auth.isLogin,orderController.changePrimary)
userRoute.get('/success',auth.isLogin,orderController.success)
userRoute.get('/failure',auth.isLogin,orderController.failure)
userRoute.get('/orderDetails',auth.isLogin,orderController.orderDetails)
userRoute.get('/profileOrderList',auth.isLogin,orderController.orderList)
userRoute.put('/cancelOrder',auth.isLogin,orderController.cancelOrder) 

//Coupon
userRoute.get('/applyCoupon/:id',auth.isLogin,orderController.applyCoupon)
userRoute.get('/couponVerify/:id',auth.isLogin,orderController.verifyCoupon)


userRoute.post('/verifyPayment',auth.isLogin,orderController.verifyPayment) 
userRoute.post('/paymentFailed',auth.isLogin,orderController.paymentFailed)


//Wishlist
userRoute.post('/add-to-wishlist',auth.isLogin,wishlistController.addWishList)
userRoute.get('/wishlist',auth.isLogin,wishlistController.getWishList)
userRoute.delete('/remove-product-wishlist',auth.isLogin,wishlistController.removeProductWishlist)




userRoute.get('/error-404',userController.error404)
userRoute.get('/error-403',userController.error403)
userRoute.get('/error-500',userController.error500)

userRoute.get('/invoice',auth.isLogin,orderController.downloadInvoice)



module.exports = userRoute

