const SiteOption = require('../model/siteOption');
const mongoose = require('mongoose');
const multer = require('multer');
const ObjectId = mongoose.Types.ObjectId;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./logo/`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    },
});

exports.upload = multer({ storage: storage });

exports.createSitOptions = async (req, res) => {
    try {
        const body = req.body;
        let imagePath = ""
        if (req.file) {
            imagePath = req.file.path
        } 
        const siteOptions = new SiteOption({
            logo: imagePath,
            title: body.title,
            subTitle: body.subTitle,
            copyRightText: body.copyRightText,
            
        })
        await siteOptions.save()
            .then(sitoptionData => {
                res.status(200).send({ message: "siteOptions added successfully ....", data: sitoptionData })
            }).catch(err => {
                res.status(400).send({ message: err.message })
            })
    } catch (err) {

    }
}

exports.getAllSitOptions = async (req, res) => {
    try {
        await SiteOption.find()
            .then(AllData => {
                res.status(200).send(AllData);
            })
            .catch(err => {
                res.status(400).send({ message: err.message })
            })
    } catch (error) {
        res.status(400).send({ message: err.message })
    }

}

exports.updateSitOptions = async (req, res) => {
    try {
        const body = req.body;
        var siteOptionsId = req.query.id;
        let imagePath = ""
        if (req.file) {
            imagePath = req.file.path
        }
        var newsiteOptions = {
            logo: '',
            title: body.title,
            subTitle: body.subTitle,
            copyRightText: body.copyRightText,
        }
        if (Object.keys(body).length === 0 && body.constructor === Object) {
            res.status(400).send({ message: "Data Not Proper Formated..." })
        }
        else if (!ObjectId.isValid(siteOptionsId)) {
            res.status(400).send({ message: "siteOptionsId  is not valid" })
        }
        else {
            await SiteOption.findById(siteOptionsId).then(sitoptionData => {
                if (req.file === undefined) {
                    newsiteOptions.logo = sitoptionData.logo
                } else {
                    newsiteOptions.logo = imagePath
                }
                SiteOption.findByIdAndUpdate((siteOptionsId), newsiteOptions, { new: true }).then(updateData => {
                    if (!updateData) {
                        res.status(404).send({ message: "siteOptions is not found in database" })
                    } else {
                        res.status(200).send({ message: "siteOptions updated successfully.....", updatedData: updateData })
                    }
                }).catch(err => {
                    res.status(400).send({ message: err.message })
                })
            }).catch(err => {
                res.status(400).send({ message: err.message })
            })
        }
    }
    catch (error) {
        res.status(400).send({ message: error.message, subError: "catch error" })
    }
}

exports.deleteSitOptions = async(req,res) => {
    try{
        const siteOptionsId = req.query.id;
        if (!ObjectId.isValid(siteOptionsId) && !ObjectId(siteOptionsId)) {
            res.status(400).send({ message: "please insert valid siteOptionsId" })
        } else {
            SiteOption.findById(siteOptionsId).then(sitoptionData=>{
             if(!sitoptionData){
                res.status(404).send({message:"siteOptions not found in database."})
             }else{
                SiteOption.findByIdAndRemove(siteOptionsId, function (err, docs) {
                    if (err){
                       res.status(400).send({message:err.message})
                    }
                    else{
                        res.status(200).send({message:"Removed siteOptions successfully"});
                    }
                });
             }
            }).catch(err=>{
                res.status(400).send({message:err.message})
            })  
        }
    }catch(err){
        res.status(400).send({message:err.message})
    }
}