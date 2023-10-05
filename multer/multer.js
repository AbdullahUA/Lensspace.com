const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.resolve(__dirname, '../views/admin/admin-assets/imgs/product-images/');
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        const fileName = Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    // Allowed file types
    const fileTypes = /jpeg|jpg|png/;
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only jpg, jpeg, and png are allowed.'), false);
    }
};

const addBanner = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../views/admin/banner_images'))
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
})



const updateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
      // Define the destination path for updating images
      const destinationPath = path.resolve(__dirname, '../views/admin/admin-assets/imgs/product-updates/');
      cb(null, destinationPath);
  },  filename: function (req, file, cb) {
    // Use a different naming strategy for updated images if needed
    const fileName = Date.now() + '-update' + path.extname(file.originalname);
    cb(null, fileName);
}
});

module.exports = {
    upload: multer({ 
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 2 * 1024 * 1024 // setting the limit for each image to 2MB
        }
    }).array("images", 3),
    addBannerUpload: multer({storage: addBanner}).single('image'),  // Allow a maximum of 3 images to be uploaded at once
    update: multer({
      storage: updateStorage,
      fileFilter: fileFilter,
      limits: {
          fileSize: 2 * 1024 * 1024 // setting the limit for each updated image to 2MB
      }
  }).array("updateImages", 3), // Adjust the field name as needed


  };