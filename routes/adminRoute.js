const express = require('express')
const adminRoute = express()
const session=require('express-session')
const cookieparser=require('cookie-parser')
const adminConfig=require("../configuration/AdminConfig")
adminRoute.use(session({secret:adminConfig.sessionSecret,resave:false,saveUninitialized:false}))
const validate = require('../middleware/adminAuth')
const adminController = require('../controllers/adminController')
const categoryController=require('../controllers/categoryController')
const productController=require('../controllers/productController')
const couponController= require('../controllers/couponController')

const multer=require('../multer/multer')
const nocache=require('nocache')
adminRoute.use(nocache())


// view engine
adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

//Parsing
adminRoute.use(express.json())
adminRoute.use(express.urlencoded({extended:true}))
adminRoute.use(cookieparser())
const adminAuth=require("../middleware/adminAuth")



//Login & validation
adminRoute.get("/",adminAuth.isLogout,adminController.adminLogin)
adminRoute.post("/adminLoginValidate",adminController.varifyLogin)
adminRoute.get("/dashboard",adminAuth.isLogin,adminController.loadDashboard)
adminRoute.get("/logout",adminAuth.isLogin,adminController.adminLogout)

//UserManagement
adminRoute.get("/user",adminAuth.isLogin,adminController.loadUsers)
adminRoute.post("/blockUser",adminAuth.isLogin,adminController.blockUser)
adminRoute.post("/unblockUser",adminAuth.isLogin,adminController.UnblockUser)


//CategoryManagement
adminRoute.get('/category',adminAuth.isLogin,categoryController.loadCategory)
adminRoute.get('/addCategory',adminAuth.isLogin,categoryController.loadAddCategory)
adminRoute.post('/addCategory',adminAuth.isLogin,categoryController.createCategory)
adminRoute.get('/unlistCategory',adminAuth.isLogin,categoryController.unlistCategory)
adminRoute.get('/relistCategory',adminAuth.isLogin,categoryController.relistCategory)
adminRoute.get('/editCategory',adminAuth.isLogin,categoryController.loadEditCategory)
adminRoute.post('/editCategory',adminAuth.isLogin,categoryController.updateCategory)


//ProductManagement

adminRoute.get('/displayProduct',adminAuth.isLogin,productController.displayProduct)
adminRoute.get('/addProduct',adminAuth.isLogin,productController.loadAddProduct)
adminRoute.post('/addProduct',multer.upload,productController.createProduct)
adminRoute.get('/unlistProduct',adminAuth.isLogin,productController.unlistProduct)
adminRoute.get('/relistProduct',adminAuth.isLogin,productController.relistProduct)
adminRoute.get('/editProduct',adminAuth.isLogin,productController.loadEditProduct)
adminRoute.post('/editProduct',adminAuth.isLogin,productController.updateProduct)
adminRoute.post('/deleteImage',adminAuth.isLogin,productController.deleteImage)


//Order Management 
adminRoute.get('/orderList',adminAuth.isLogin,adminController.loadOrderList)
adminRoute.get('/orderDetails',adminAuth.isLogin,adminController.loadOrderDetails)
adminRoute.put('/orderStatus',adminAuth.isLogin,adminController.changeOrderStatus)
adminRoute.put('/returnOrder',adminAuth.isLogin,adminController.returnOrder)
adminRoute.put('/cancelOrder',adminAuth.isLogin,adminController.cancelOrder)

//Coupon Management

adminRoute.get('/addCoupon',adminAuth.isLogin,couponController.loadAddCoupon)
adminRoute.post('/addCoupon',adminAuth.isLogin,couponController.addCoupon)
adminRoute.get('/generate-coupon-code',adminAuth.isLogin,couponController.generateCouponCode)
adminRoute.get('/couponList',adminAuth.isLogin,couponController.couponList)
adminRoute.delete('/deleteCoupon',adminAuth.isLogin,couponController.deleteCoupon)



module.exports=adminRoute