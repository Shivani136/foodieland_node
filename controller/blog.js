const Blog = require('../model/blog');
const User = require('../model/user');
const Category = require('../model/category');
const mongoose = require('mongoose');
const multer = require('multer');
const res = require('express/lib/response');
const ObjectId = mongoose.Types.ObjectId;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./blogs/`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    },
});

exports.upload = multer({ storage: storage });

exports.createBlog = async (req, res) => {
    try {
        const body = req.body;
        const userId = body.userId;
        const categoryId = body.categoryId;

        const blog = new Blog({
            userId: body.userId,
            categoryId: body.categoryId,
            title: body.title,
            subTitle: body.subTitle,
            description: body.description,
            image: '',
            video: '',
            blogFAQ: body.blogFAQ
        });
        var faqImage = [];

        for (var i = 0; i < req.files.length; i++) {
            var fieldname = req.files[i].fieldname
            blog[fieldname] = req.files[i].path
            if (i >= 2) {
                faqImage.push(req.files[i].path)
            }
        }
        for (var k = 0; k < blog.blogFAQ.length; k++) {
            blog.blogFAQ[k]['faqImage'] = faqImage[k]
        }
        if (Object.keys(body).length === 0 && body.constructor === Object) {
            res.status(400).send({ message: "Data Not Proper Formated..." })
        }
        if (!ObjectId.isValid(userId) && !ObjectId(userId)) {
            res.status(400).send({ message: "please insert valid userId" })
        }
        else if (!ObjectId.isValid(categoryId) && !ObjectId(categoryId)) {
            res.status(400).send({ message: "please insert valid categoryId" })
        } else {
            await User.findById(userId).then(userData => {
                if (!userData) {
                    res.status(404).send({ message: "user not found." })
                } else {
                    blog.userId = userData._id;
                    Category.findById(categoryId).then(categoryData => {
                        if (!categoryData) {
                            res.status(404).send({ message: "Category not found." })
                        } else {
                            blog.categoryId = categoryData._id;
                            blog.save().then((blogData) => {
                                if (!blogData) {
                                    res.status(400).send({ message: "blog not added." })
                                } else {
                                    res.status(200).send({ message: "blog added successfully..", data: blogData })
                                }
                            })
                        }
                    }).catch(err => {
                        res.status(400).send({ message: err.message })
                    })
                }
            }).catch(err => {
                res.status(400).send({ message: err.message })
            })
        }
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.getAllBlogs = async (req, res) => {
    try {
        const limitValue = req.query.limit || 5;
        const skipValue = req.query.skip || 0;
        Blog.find()
            .limit(limitValue).skip(skipValue)
            .populate([{ path: "userId", select: "-password" }])
            .populate("categoryId")
            .then((blogData) => {
                res.status(200).send(blogData)
            }).catch(err => {
                res.status(400).send({ message: err.message })
            })

        // var totalNumberOfPage = 0
        // var reminder = 0
        // var totalPages = 0
        // const perPage = req.query.perPage || 3;
        // var skipValue;
        // var initialSkipValue = 0;
        // var limitValue;
        // var temLimitValue;
        // var tempSkipValue
        // var pagesArray = []
        // Blog.find()
        //     .then(data => {

        //         if (data.length % perPage === 0) {
        //             totalNumberOfPage = (data.length / perPage).toFixed()
        //             totalPages = totalNumberOfPage
        //         } else {
        //             reminder = 1
        //             totalNumberOfPage = Math.floor(data.length / perPage).toFixed()
        //             totalPages = parseInt(reminder) + parseInt(totalNumberOfPage)
        //         }
        //         for (var i = 1; i <= totalPages; i++) {

        //             if (i === 1) {
        //                 skipValue = parseInt(initialSkipValue)
        //                 limitValue = parseInt(perPage)
        //             }
        //             else {
        //                 skipValue = temLimitValue
        //                 limitValue = parseInt(skipValue) + parseInt(perPage)
        //             }
        //             temLimitValue = limitValue;
        //             tempSkipValue = skipValue
        //             pagesArray.push({
        //                 pageNo: i,
        //                 skipValue: skipValue,
        //                 limitValue: limitValue
        //             })
        //         }

        //         paginations(pagesArray).then(result => {
        //             res.send(result)
        //         }).catch(err => {
        //             res.send({ message: err.message })
        //         })

        //     }).catch(err => {
        //         res.status(400).send({ message: err.message })
        //     })
    } catch (err) {
        res.status(400).send({ message: err.message })
    }
}

async function paginations(pagesInfoArray) {
    var limit, skip , startIndex , endIndex;
    var a = [];
    var pageNo;

    for (var i = 0; i < pagesInfoArray.length; i++) {
        limit = pagesInfoArray[i].limitValue,
        skip = pagesInfoArray[i].skipValue
        pageNo = pagesInfoArray[i].pageNo
       
        await Blog.find()
        .populate([{ path: "userId", select: "-password" }])
        .populate("categoryId")
        .then((blogData) => {
            a.push({ pageNo: pageNo, pageContent: blogData.slice(skip,limit)})
        }).catch(err => {
            res.status(400).send({ message: err.message })
        })
    }

    return a;
}

exports.getBlog = async (req, res) => {
    try {
        const blogId = req.query.id;
        if (!ObjectId.isValid(blogId) && !ObjectId(blogId)) {
            res.status(400).send({ message: "please insert valid recipeId" })
        } else {
            Blog.findById(blogId)
                .populate([{ path: "userId", select: "-password" }])
                .populate("categoryId")
                .then((response) => {
                    if (!response) {
                        res.status(200).send({ message: "blog Not Found..." });
                    } else {
                        res.status(200).send(response);
                    }
                })
                .catch((err) => {
                    res.status(400).send({ message: err.message });
                });
        }

    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

exports.changeStatus = async (req, res) => {
    try {
        const body = req.body
        var ownerId = body.ownerId
        var blogId = body.blogId
        var status = req.query.status;
        var deleteData = {
            isDeleted: true,
            deletedBy: ''
        }
        var statusObj = {
            status: req.query.status
        }
        if (!status) {
            res.status(400).send({ message: "status not found" })
        }
        else if (!ObjectId.isValid(ownerId)) {
            res.status(400).send({ message: "ownerId  is not valid" })
        }
        else if (!ObjectId.isValid(blogId)) {
            res.status(400).send({ message: "blogId  is not valid" })
        } else {
            try {
                User.findById(ownerId).then(ownerData => {
                    if (!ownerData) {
                        res.status(404).send({ message: "ownerId not found in database." })
                    } else {
                        deleteData.deletedBy = ownerData._id;
                        Blog.findById(blogId).then(blogData => {
                            if (!blogData) {
                                res.status(404).send({ message: "blogId not found in database." })
                            } else {
                                console.log(blogData)
                                if (status === "isDeleted" && blogData.isDeleted === false) {
                                    Blog.findByIdAndUpdate(blogId, deleteData, { new: true }, (error, deletedData) => {
                                        if (!deletedData) {
                                            res.status(404).send('deleted blog not found..')
                                        }
                                        else if (error) {
                                            res.status(400).send({
                                                message: "blog not deleted"
                                            });
                                        } else {
                                            res.status(200).send({
                                                message: "blog deleted successfully"
                                            });
                                        }
                                    })
                                }
                                else if (status === "isDeleted" && blogData.isDeleted === true) {
                                    res.status(200).send({ message: "already deleted" });
                                }
                                else if (status === "approved" && blogData.status === 'approved' ) {
                                    res.send({ message: 'already approved' })
                                }
                                else if (status === 'approved' && (blogData.status === 'pending' || 'draft' || 'unapproved')) {
                                    changeBlogStatus(blogId, statusObj).then(result => {
                                        res.status(200).send({
                                            message: "blog status approved successfully..",
                                            result
                                        })
                                    }).catch(err => {
                                        res.status(400).send({ message: err.message })
                                    })
                                }      
                                else if (status === "unapproved" && blogData.status === 'approved') {
                                    changeBlogStatus(blogId, statusObj).then(result => {
                                        res.status(200).send({
                                            message: "blog status unapproved successfully..",
                                            result
                                        })
                                    }).catch(err => {
                                        res.status(400).send({ message: err.message })
                                    })
                                }
                                else if (status === "unapproved" && (blogData.status === 'pending' || blogData.status === 'draft')) {
                                    res.send({ message: 'blog status not unapproved .firtly recipe should be approved.' })
                                }
                                else if (status === "unapproved" && blogData.status === 'unapproved') {
                                    res.send({ message: 'blog status already unapproved ' })
                                }
                                else if (status === "draft" && blogData.status === 'pending') {
                                    changeBlogStatus(blogId, statusObj).then(result => {
                                        res.status(200).send({
                                            message: "blog drafted successfully..",
                                            result
                                        })
                                    }).catch(err => {
                                        res.status(400).send({ message: err.message })
                                    })
                                }
                                else if (status === "draft" && blogData.status === 'draft') {
                                    res.send({ message: 'Blog already drafted.' })
                                }
                            }
                        }).catch(err => {
                            res.status(400).send({ message: err.message })
                        })
                    }
                }).catch(err => {
                    res.status(400).send({ message: err.message })
                })
            } catch (err) {
                res.status(400).send({ message: err.message })
            }
        }
    } catch (err) {
        res.status(400).send({ message: err.message })
    }
}

async function changeBlogStatus(id, blogObj) {
    var result;
    await Blog.findByIdAndUpdate({ _id: id }, blogObj, { new: true }).then(updatedData => {
        if (!updatedData) {
            result = { message: "blog not found." }
        } else {
            result = updatedData
        }
    })
    return result
}

exports.updateBlog = async (req, res) => {
    try {
        const body = req.body;
        const blogId = req.query.id;
        // const userId = body.userId;
        const categoryId = body.categoryId;

        var blog = {
            userId: body.userId,
            categoryId: body.categoryId,
            title: body.title,
            subTitle: body.subTitle,
            description: body.description,
            image: '',
            video: '',
            blogFAQ: body.blogFAQ
        };
        var faqImage = [];
        for (var i = 0; i < req.files.length; i++) {
            var fieldname = req.files[i].fieldname
            blog[fieldname] = req.files[i].path
            if (i >= 2) {
                faqImage.push(req.files[i].path)
            }
        }
        for (var k = 0; k < blog.blogFAQ.length; k++) {
            blog.blogFAQ[k]['faqImage'] = faqImage[k]
        }
        if (!ObjectId.isValid(blogId) && !ObjectId(blogId)) {
            res.status(400).send({ message: "please insert valid blogId" })
        }
        // else if (!ObjectId.isValid(userId) && !ObjectId(userId)) {
        //     res.status(400).send({ message: "please insert valid userId" })
        // }
        else if (!ObjectId.isValid(categoryId) && !ObjectId(categoryId)) {
            res.status(400).send({ message: "please insert valid categoryId" })
        } else {
            await Blog.findById(blogId).then(blogData => {
                if (!blogData) {
                    res.status(404).send({ message: "blog not found in database" })
                } else {
                    // User.findById(userId).then(userdata => {
                    //     if (!userdata) {
                    //         res.status(404).send({ message: "user not found in database" })
                    //     } 
                    //     else {
                            Category.findById(categoryId).then(categoryData => {
                                if (!categoryData) {
                                    res.status(404).send({ message: "Category not found." })
                                } else {
                                    Blog.findByIdAndUpdate(blogId, blog, { new: true }).then(updatedBlog => {
                                        res.status(200).send({ message: "Blog updated successfully..", updatedBlog: updatedBlog })
                                    }).catch(err => {
                                        res.status(400).send({ message: err.message })
                                    })
                                }
                            }).catch(err => {
                                res.status(400).send({ message: err.message })
                            })
                        }
                //     }).catch(err => { res.status(400).send({ message: error.message }) })
                // }
            }).catch(err => {
                res.status(400).send({ message: error.message })
            })
        }
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.searchBlogs = async (req,res) => {
    try{
        let data = await Blog.find({
            "$or":[
                {title:{$regex : req.query.key}},
                {subTitle:{$regex : req.query.key}},
                {description:{$regex : req.query.key}}
            ]
        }); 
        res.status(200).send(data)
    }catch(err){
        res.status(400).send({message:err.message})
    }
}