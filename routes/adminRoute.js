const express = require('express')
const adminRoute = express()
const session=require('express-session')
const cookieparser=require('cookie-parser')
const adminConfig=require("../configuration/AdminConfig")
adminRoute.use(session({secret:adminConfig.sessionSecret,resave:false,saveUninitialized:false}))
const auth = require('../middleware/adminAuth')
const adminController = require('../controllers/adminController')
const categoryController=require('../controllers/categoryController')
const productController=require('../controllers/productController')
const couponController= require('../controllers/couponController')
const offerController = require('../controllers/offerController')

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
adminRoute.get("/",auth.isLogout,adminController.adminLogin)
adminRoute.post("/adminLoginValidate",adminController.varifyLogin)
adminRoute.get('/dashboard',auth.isLogin,adminController.loadDashboard)
adminRoute.get("/logout",auth.isLogin,adminController.adminLogout)

//UserManagement
adminRoute.get("/user",auth.isLogin,adminController.loadUsers)
adminRoute.post("/blockUser",auth.isLogin,adminController.blockUser)
adminRoute.post("/unblockUser",auth.isLogin,adminController.UnblockUser)


//CategoryManagement
adminRoute.get('/category',auth.isLogin,categoryController.loadCategory)
adminRoute.get('/addCategory',auth.isLogin,categoryController.loadAddCategory)
adminRoute.post('/addCategory',auth.isLogin,categoryController.createCategory)
adminRoute.get('/unlistCategory',auth.isLogin,categoryController.unlistCategory)
adminRoute.get('/relistCategory',auth.isLogin,categoryController.relistCategory)
adminRoute.get('/editCategory',auth.isLogin,categoryController.loadEditCategory)
adminRoute.post('/editCategory',auth.isLogin,categoryController.updateCategory)


//ProductManagement

adminRoute.get('/displayProduct',auth.isLogin,productController.displayProduct)
adminRoute.get('/addProduct',auth.isLogin,productController.loadAddProduct)
adminRoute.post('/addProduct',auth.isLogin,multer.upload,productController.createProduct)
adminRoute.get('/unlistProduct',auth.isLogin,productController.unlistProduct)
adminRoute.get('/relistProduct',auth.isLogin,productController.relistProduct)
adminRoute.get('/editProduct',auth.isLogin,productController.loadEditProduct)
adminRoute.post('/editProduct',auth.isLogin,multer.upload,productController.updateProduct)
adminRoute.post('/deleteImage',auth.isLogin,productController.deleteImage)


//Order Management 
adminRoute.get('/orderList',auth.isLogin,adminController.loadOrderList)
adminRoute.get('/orderDetails',auth.isLogin,adminController.loadOrderDetails)
adminRoute.put('/orderStatus',auth.isLogin,adminController.changeOrderStatus)
adminRoute.put('/returnOrder',auth.isLogin,adminController.returnOrder)
adminRoute.put('/cancelOrder',auth.isLogin,adminController.cancelOrder)

//Coupon Management

adminRoute.get('/addCoupon',auth.isLogin,couponController.loadAddCoupon)
adminRoute.post('/addCoupon',auth.isLogin,couponController.addCoupon)
adminRoute.get('/generate-coupon-code',auth.isLogin,couponController.generateCouponCode)
adminRoute.get('/couponList',auth.isLogin,couponController.couponList)
adminRoute.delete('/deleteCoupon',auth.isLogin,couponController.deleteCoupon)


//Sales Report
adminRoute.get('/salesReport',auth.isLogin,adminController.getSalesReport)
adminRoute.post('/salesReport',auth.isLogin,adminController.postSalesReport)



//offers
adminRoute.get('/categoryOffer',auth.isLogin,offerController.loadCategoryOffer)
adminRoute.post('/categoryOffer',auth.isLogin,offerController.updateCategoryOffer)





module.exports=adminRoute