const multer = require('multer');

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/')
    },
    filename:function(rea,file,cb){
        cb(null,Date.now()+file.originalname)
    }
});

exports.upload = multer({storage:storage});