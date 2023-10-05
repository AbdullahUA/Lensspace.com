const bannerHelper = require('../helpers/bannerHelper')


const getAddBanner = async(req,res)=>{
    try{
        res.render('addBanner') 
    }
    catch(error){
        console.log(error);
    }
}


const postAddBanner = async(req,res)=>{
    bannerHelper.addBannerHelper(req.body, req.file.filename).then(( response) => {
        if (response) {
            res.redirect("/admin/addBanner");
        } else {
            res.status(505);
        }
    });
}


const bannerList = async(req,res)=>{

    try{
        bannerHelper.bannerListHelper().then((response)=> {
            res.render('bannerList',{banners:response})

        })
        
    }
    catch(error){
        console.log(error);
    }
}

const deleteBanner = async(req,res)=>{
    bannerHelper.deleteBannerHelper(req.query.id).then(() => {
        res.redirect("/admin/bannerList")
    });
}







module.exports={
    getAddBanner,
    postAddBanner,
    bannerList,
    deleteBanner,

}