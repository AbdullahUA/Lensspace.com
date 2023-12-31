const Category = require('../models/categoryModel');
const categoryHelper = require('../helpers/categoryHelper')


const loadCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render('categoryManagement', { categories });
  } catch (error) {
    console.error('Error loading categories:', error);
    res.status(500).send('Internal Server Error');
  }
}


const loadAddCategory = async (req, res) => {
  try {
    res.render('addCategory')
  } catch (error) {
    console.error(error.message);
    
  }
};

const createCategory = async(req, res)=>{
    try {
      const categoryName = req.body.name.toLowerCase()
      const existingCategory = await Category.findOne({name:categoryName})

      if(existingCategory){
        return res.render("addCategory",{message:"Category already exists"})
      } 
      if (!req.body.name || req.body.name.trim().length === 0) {
        return res.render("addCategory", { message: "Name is required" });
    }
      if (!req.body.description || req.body.description.trim().length === 0) {
        return res.render("addCategory", { message: "Description is required" });
  }

       await categoryHelper.createCategory(req.body)
      res.redirect('/admin/category')
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ error: 'Failed to create category' });
    }
  }

//Deleting a category
  const unlistCategory = async(req, res)=>{
    try {
      await categoryHelper.unlistCategory(req.query.id)
      res.redirect('/admin/category')
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }

  const relistCategory = async(req, res)=>{
    try {
      console.log('haiaiaiaiiaaiaiai')
      await categoryHelper.relistCategory(req.query.id)
      res.redirect('/admin/category')
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
  

    const loadEditCategory = async(req,res)=>{
        try {
          const id = req.query.id
          const Categorydata = await categoryHelper.loadEditCategory(id)
          res.render('updateCategory',{category:Categorydata})
        } catch (error) {
          console.log(error.message)
        }
      }

    const updateCategory= async (req, res)=> {
        try {
          const categoryId  = req.body.id
          await categoryHelper.updateCategory(categoryId,req.body)
          res.redirect('/admin/category')
        } catch (error) {
          console.log(error.message)
          res.status(500).json({ error: 'Failed to update category' });
        }
      }
  


  
  module.exports = {
    loadCategory,
    loadAddCategory,
    createCategory,
    unlistCategory,
    relistCategory,
    loadEditCategory,
    updateCategory,
    
  };
  