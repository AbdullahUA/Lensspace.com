const Product=require('../models/productModel')
const Category=require('../models/categoryModel')
const productHelper=require('../helpers/productHelper')
const cartHelper = require('../helpers/cartHelper')
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const path=require('path')


const loadAddProduct= async(req,res)=>{
    try {
    const categories=await Category.find({})
    res.render('addProduct',{category:categories})
        
    } catch (error) {
        console.log(error.message)
    }
}
const displayProduct = async(req,res)=>{
  try {

    const product = await Product.find({})
    res.render('displayProduct',{product:product})    
  } catch (error) {
    console.log(error.message)
  }
}

const loadProducts=async(req,res)=>{
  try {
    res.render('addProduct')
    
  } catch (error) {
    console.log(error.message)
  }
}


const createProduct = async(req, res) => {
  try {
    const categories = await Category.find({})
    if (!req.body.name || req.body.name.trim().length === 0) {
      return res.render("addProduct", { message: "Name is required",category:categories });
  }
  if (!req.body.description || req.body.description.trim().length === 0) {
    return res.render("addProduct", { message: "Description is required",category:categories });
}
  if(req.body.price<=0){
    return res.render("addProduct", { message: "Product Price Should be greater than 0",category:categories });
  }
  if(req.body.stock< 0 || req.body.stock.trim().length === 0 ){
    return res.render("addProduct", { message: "Stock  Should be greater than 0",category:categories });
  }

    const images = req.files.map(file => file.filename);
    await productHelper.createProduct(req.body,images)
    res.redirect('/admin/displayProduct');
  } catch (error) {
    console.log(error)
    
  }

};

  const unlistProduct=async(req,res)=>{
    try {
      await productHelper.unlistProduct(req.query.id)
      res.redirect('/admin/displayProduct')
    } catch (error) {
      console.log(error.message)
    }
  }
  const relistProduct=async(req,res)=>{
    try {
      await productHelper.relistProduct(req.qurey.id)
      res.redirect('/admin/displayProduct')
    } catch (error) {
      console.log(error.message)
    }
  }
  

  const loadEditProduct = async(req,res)=>{
    try {
      const categories = await Category.find({})
      const id = req.query.id;
      const productData = await Product.findById({_id:id})
      res.render('updateProduct',{product:productData,category:categories})
      console.log('load edit data rendered')
      
    } catch (error) {
      console.log(error)
      
    }
  }



  const updateProduct = async (req, res) => {
    try {
console.log("><><><<><<><",req.body);
console.log(req.files);

      const productData = await Product.findById(req.body.id);
   

      const categories = await Category.find({})
      if (!req.body.name || req.body.name.trim().length === 0) {
        return res.render("updateProduct", { message: "Name is required",product:productData,category:categories });
    }
    if (!req.body.description || req.body.description.trim().length === 0) {
      return res.render("updateProduct", { message: "Description is required",product:productData,category:categories });
  }
    if(req.body.price<=0){
      return res.render("updateProduct", { message: "Product Price Should be greater than 0",product:productData,category:categories });
    }
    if(req.body.stock<0 || req.body.stock.trim().length === 0 ){
      return res.render("updateProduct", { message: "Stock Should be greater than 0",product:productData,category:categories });
    }
        const images = req.files.map((file) => file.filename);
        const updatedImages = images.length > 0 ? images : productData.images;
        await productHelper.updateProduct(req.body,req.files.filename)
        res.redirect('/admin/displayProduct');
    } catch (error) {
      console.log(error.message);
    }
  };



const productDetails = async ( req, res ) => {
  try{
    const usercart = res.locals.user
    const categories = await Category.find({})
    const count = await cartHelper.getCartCount(usercart.id)
    const id = req.query.id
    const product = await Product.findOne({ _id : id }).populate('category')
    if(product.isProductListed == true && product.isListed == true){
      res.render('public/productdetails.ejs',{product : product,count:count,category:categories})
  }}
  catch(error){
      console.log(error);
      res.send({success:false,error:error.message})

}

}
const deleteImage = async (req, res) => {
  try {
console.log(req.query,"ths is qury");

    const img=req.query.img
    console.log(img,">>>>>>>");
const id=req.query.id

    const product = await Product.findByIdAndUpdate(id, {
      $pull: { images: img }
    });

    console.log(product,"this is priduct");
    const imagePath = path.join('views', 'admin', 'admin-assets', 'imgs', 'product-images', img);
    await unlinkAsync(imagePath);
    console.log('iam here',imagePath);

    res.redirect(`/admin/editProduct?id=${id}`)



    

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};





module.exports={
    loadProducts,
    displayProduct,
    loadAddProduct,
    createProduct,
    unlistProduct,
    relistProduct,
    loadEditProduct,
    updateProduct,
    productDetails,
    deleteImage

}