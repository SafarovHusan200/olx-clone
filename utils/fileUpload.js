const multer = require("multer");
const path = require("path")
 
// Set storage
const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function(req, file, cb){
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname) )
    }
})

// Initilaize upload
const upload = multer({
    storage,
    limits: { fileSize: 10000000 },
    fileFilter: function(req, file, cb){
        checkFileType(file, cb)
    }    
})

// Chek file for image
function checkFileType(file, cb){
    const fileTypes = /jpeg|jpg|png|gif/
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = fileTypes.test(file.mimetype)

    if(mimetype && extname){
        return cb(null, true)
    } else{
        cb(`Error: You can only upload image files`)
    }
}

module.exports = upload