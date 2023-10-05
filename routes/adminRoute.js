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
const bannerController = require('../controllers/bannerController')

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
adminRoute.get("/",adminController.adminLogin)
adminRoute.post("/adminLoginValidate",adminController.varifyLogin)
adminRoute.get('/dashboard',adminController.loadDashboard)
adminRoute.get("/logout",adminController.adminLogout)

//UserManagement
adminRoute.get("/user",adminController.loadUsers)
adminRoute.post("/blockUser",adminController.blockUser)
adminRoute.post("/unblockUser",adminController.UnblockUser)


//CategoryManagement
adminRoute.get('/category',categoryController.loadCategory)
adminRoute.get('/addCategory',categoryController.loadAddCategory)
adminRoute.post('/addCategory',categoryController.createCategory)
adminRoute.get('/unlistCategory',categoryController.unlistCategory)
adminRoute.get('/relistCategory',categoryController.relistCategory)
adminRoute.get('/editCategory',categoryController.loadEditCategory)
adminRoute.post('/editCategory',categoryController.updateCategory)


//ProductManagement

adminRoute.get('/displayProduct',productController.displayProduct)
adminRoute.get('/addProduct',productController.loadAddProduct)
adminRoute.post('/addProduct',multer.upload,productController.createProduct)
adminRoute.get('/unlistProduct',productController.unlistProduct)
adminRoute.get('/relistProduct',productController.relistProduct)
adminRoute.get('/editProduct',productController.loadEditProduct)
adminRoute.post('/editProduct',multer.update,productController.updateProduct)
adminRoute.post('/deleteImage',productController.deleteImage)


//Order Management 
adminRoute.get('/orderList',adminController.loadOrderList)
adminRoute.get('/orderDetails',adminController.loadOrderDetails)
adminRoute.put('/orderStatus',adminController.changeOrderStatus)
adminRoute.put('/returnOrder',adminController.returnOrder)
adminRoute.put('/cancelOrder',adminController.cancelOrder)

//Coupon Management

adminRoute.get('/addCoupon',couponController.loadAddCoupon)
adminRoute.post('/addCoupon',couponController.addCoupon)
adminRoute.get('/generate-coupon-code',couponController.generateCouponCode)
adminRoute.get('/couponList',couponController.couponList)
adminRoute.delete('/deleteCoupon',couponController.deleteCoupon)


//Sales Report
adminRoute.get('/salesReport',adminController.getSalesReport)
adminRoute.post('/salesReport',adminController.postSalesReport)



//Banner 

adminRoute.get('/addBanner',bannerController.getAddBanner)
adminRoute.post('/addBanner',bannerController.postAddBanner)
adminRoute.get('/bannerList',bannerController.bannerList)
adminRoute.get('/deleteBanner',bannerController.deleteBanner)





module.exports=adminRoute