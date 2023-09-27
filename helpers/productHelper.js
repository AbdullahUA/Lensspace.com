const Product =require('../models/productModel')
const {ObjectId}=require('mongodb')




const createProduct = (data,images) => {
  
    return new Promise((resolve,reject) =>{
      const newProduct = new Product({
        name:data.name,
        description:data.description,
        images:images,
        category:data.category,
        stock:data.stock,
        price:data.price
      });
  
      newProduct.save()
        .then(() =>{ 
          resolve() 
        })
        .catch((error) => {
          console.error('Error in adding product:', error);
          reject(error)
        });
      });
  
  };
  const unlistProduct =(query)=>{
    return new Promise((resolve,reject)=>{
      const id=query
      Product.updateOne({_id:id},{isProductListed:false})
      .then(()=>{
        resolve()
      })
      .catch((error)=>{
        console.log(error.message)
        reject(error)
      })
    })
  } 
  const relistProduct=(query)=>{
    return new Promise((resolve,reject)=>{
      const id=query
      Product.updateOne({_id:id},{isProductListed:true})
      .then(()=>{
        resolve()
      })
      .catch((error)=>{
        console.log(error.message)
        reject(error)
      })
    })  }

    const updateProduct=async(data,images)=>{
      try {
        const productData= await Product.updateOne(
          {_id: new ObjectId(data.id)},
          {
            $set:{
              name:data.name,
              description:data.description,
              category:data.category,
              images:images,
              stock:data.stock,
              price:data.price,
            }
          }
        )
        
        
      } catch (error) {
        console.log(error.message)
      }
    }


  module.exports={
    createProduct,
    unlistProduct,
    relistProduct,
    updateProduct
  }