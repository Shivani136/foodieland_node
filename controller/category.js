const Category = require('../model/category');
const mongoose = require('mongoose');
const User = require('../model/user');
var ObjectId = mongoose.Types.ObjectId
exports.createCtegory = async (req, res) => {
    try {
        let imagePath = ""
        if (req.file) {
            imagePath = req.file.path
        }
        console.log(imagePath)
        const body = req.body;
        const category = new Category({
            categoryName: body.categoryName,
            image: imagePath
        })
        await category.save()
            .then(catData => {
                res.status(200).send({ message: "category added successfully ....", data: catData })
            }).catch(err => {
                res.status(400).send({ message: err.message })
            })
    } catch (error) {
        res.status(400).send({ message: err.message })
    }

}

exports.getAllCategory = async (req, res) => {
    try {
        await Category.find({isDeleted:false})
            .then(AllCatData => {
                res.status(200).send(AllCatData);
            })
            .catch(err => {
                res.status(400).send({ message: err.message })
            })
    } catch (error) {
        res.status(400).send({ message: err.message })
    }

}

exports.getCategory = async (req, res) => {
    try {
        const id = req.query.id;
        if (!ObjectId.isValid(id)) {
            res.status(400).send({ message: "category id  is not valid" })
        }
        else {
            try {
                await Category.findById(id).then((categoryData) => {
                    if (!categoryData) {
                        res.status(404).send({ message: "category id not found.." })
                    } else {
                        res.status(200).send({ data: categoryData });
                    }

                }).catch(err => {
                    res.status(400).send({ message: err.message })
                })
            } catch (err) {
                res.status(400).send({ message: err.message })
            }

        }
    } catch (error) {
        res.status(400).send({ message: err.message })
    }

}

exports.updateCategory = async (req, res) => {
    try {
        const body = req.body;
        var catId = req.query.id;
        let imagePath = ""
        if (req.file) {
            imagePath = req.file.path
        }
        var newCatData = {
            categoryName: body.categoryName,
            image: ''
        }
        if (Object.keys(body).length === 0 && body.constructor === Object) {
            res.status(400).send({ message: "Data Not Proper Formated..." })

        }
        else if (!ObjectId.isValid(catId)) {
            res.status(400).send({ message: "category id  is not valid" })
        }
        else {
            await Category.findById(catId).then(catData => {
                if (req.file === undefined) {
                    newCatData.image = catData.image
                } else {
                    newCatData.image = imagePath
                }
                Category.findByIdAndUpdate((catId), newCatData, { new: true }).then(updateData => {
                    if (!updateData) {
                        res.status(404).send({ message: "category id  is not found" })
                    } else {
                        res.status(200).send({ message: "category updated successfully.....", updatedData: updateData })
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

exports.deleteCategory = async (req, res) => {
    try {
        var catId = req.query.categorId;
        var ownerId = req.query.ownerId;
        var deleteCategoryData = {
            isDeleted: true,
            DeletedBy: ''
        }
        if (!ObjectId.isValid(catId)) {
            res.status(400).send({ message: "category id  is not valid." })
        }
        else if (!ObjectId.isValid(ownerId)) {
            res.status(400).send({ message: "ownerId id  is not valid." })
        }
        else {
            User.findById(ownerId).then(ownerData => {
                if (!ownerData) {
                    res.status(404).send({ message: "owner id is not found." })
                } else {
                    deleteCategoryData.DeletedBy = ownerData._id;
                    Category.findById(catId).then(catData => {
                        if (catData.isDeleted === false) {
                            Category.findByIdAndUpdate(catId, deleteCategoryData, { new: true }, (error, deletedData) => {
                                if (!deletedData) {
                                    res.status(404).send({ message: "category id not found in the database." })
                                }
                                else {
                                    res.status(200).send({ message: "cateory  Delete Successfully." })
                                }
                            })
                        }else{
                            res.status(200).send({ message: "cateory  already deleted." })
                        }
                    }).catch(err => {
                        res.status(400).send({ message: err.message })
                    })

                }
            }).catch(err => {
                res.status(400).send({ message: err.message })
            })
        }
    } catch (err) {
        res.status(400).send({ message: err.message, subError: "catch error" })
    }
}