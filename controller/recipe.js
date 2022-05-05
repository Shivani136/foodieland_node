const Recipes = require('../model/recipe');
const User = require('../model/user');
const Category = require('../model/category');
const mongoose = require('mongoose')
var ObjectId = mongoose.Types.ObjectId
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./recipes/`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    },
});

exports.upload = multer({ storage: storage });

exports.createRecipe = async (req, res) => {
    try {
        console.log("image ",req.files.image)
        const body = req.body;
        const userId = body.userId;
        const categoryId = body.categoryId;
        const recipes = new Recipes({
            userId: body.userId,
            categoryId: body.categoryId,
            cookTime: body.cookTime,
            prepTime: body.prepTime,
            title: body.title,
            description: body.description,
            image: req.files.image[0].path,
            video: req.files.video[0].path,
            // nutritionInformation: body.nutritionInformation,
            // ingredient: body.ingredient,
            // direction: body.direction
        });

        // var directionImage = [];

        // for (var i = 0; i < req.files.length; i++) {
        //     var fieldname = req.files[i].fieldname
        //     recipes[fieldname] = req.files[i].path
        //     if (i >= 2) {
        //         directionImage.push(req.files[i].path)
        //     }
        // }
        // for (var k = 0; k < recipes.direction.length; k++) {
        //     recipes.direction[k]['directionImage'] = directionImage[k]
        // }
        if (Object.keys(body).length === 0 && body.constructor === Object) {
            res.status(400).send({ message: "Data Not Proper Formated..." })
        }
        if (!ObjectId.isValid(userId) && !ObjectId(userId)) {
            res.status(400).send({ message: "please insert valid userId" })
        }
        else if (!ObjectId.isValid(categoryId) && !ObjectId(categoryId)) {
            res.status(400).send({ message: "please insert valid categoryId" })
        }
        else {
            await User.findById(userId).then(userData => {
                if (!userData) {
                    res.status(404).send({ message: "user not found." })
                } else {
                    recipes.userId = userData._id;
                    Category.findById(categoryId).then(categoryData => {
                        if (!categoryData) {
                            res.status(404).send({ message: "Category not found." })
                        } else {
                            recipes.categoryId = categoryData._id;
                            recipes.save().then((recipeData) => {
                                if (!recipeData) {
                                    res.status(400).send({ message: "recipe not added." })
                                } else {
                                    res.status(200).send({ message: "recipe added successfully..", data: recipeData })
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

    } catch (err) {
        res.status(400).send({ message: err.message })
    }
}

exports.getAllRecipes = (req, res) => {
    try {
        var totalNumberOfPage = 0
        var reminder = 0
        var totalPages = 0
        const perPage = req.query.perPage || 3;
        var skipValue;
        var initialSkipValue = 0;
        var limitValue;
        var temLimitValue;
        var tempSkipValue
        var pagesArray = []
        Recipes.find()
            .then(data => {

                if (data.length % perPage === 0) {
                    totalNumberOfPage = (data.length / perPage).toFixed()
                    totalPages = totalNumberOfPage
                } else {
                    reminder = 1
                    totalNumberOfPage = Math.floor(data.length / perPage).toFixed()
                    totalPages = parseInt(reminder) + parseInt(totalNumberOfPage)
                }
                for (var i = 1; i <= totalPages; i++) {

                    if (i === 1) {
                        skipValue = parseInt(initialSkipValue)
                        limitValue = parseInt(perPage)
                    }
                    else {
                        skipValue = temLimitValue
                        limitValue = parseInt(skipValue) + parseInt(perPage)
                    }
                    temLimitValue = limitValue;
                    tempSkipValue = skipValue
                    pagesArray.push({
                        pageNo: i,
                        skipValue: skipValue,
                        limitValue: limitValue
                    })
                }
                paginations(pagesArray).then(result => {
                    res.send(result)
                }).catch(err => {
                    res.send({ message: err.message })
                })
            }).catch(err => {
                res.status(400).send({ message: err.message })
            })
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
};

exports.getRecipes = (req, res) => {
    try {
        const recipeId = req.query.id;
        if (!ObjectId.isValid(recipeId) && !ObjectId(recipeId)) {
            res.status(400).send({ message: "please insert valid recipeId" })
        } else {
            Recipes.findById(recipeId)
                .populate([{ path: "userId", select: "-password" }])
                .populate("categoryId")
                .then((response) => {
                    if (!response) {
                        res.status(200).send({ message: "recipeId Not Found..." });
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
};

exports.changeStatus = async (req, res, next) => {
    try {
        const body = req.body;
        var ownerId = body.ownerId
        var recipeId = body.recipeId
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
        else if (!ObjectId.isValid(recipeId)) {
            res.status(400).send({ message: "recipeId  is not valid" })
        }
        else {
            try {
                await User.findById(ownerId).then(ownerData => {
                    if (!ownerData) {
                        res.status(404).send({ message: 'ownerId not found in database..' })
                    } else {
                        deleteData.deletedBy = ownerData._id
                        Recipes.findById(recipeId).then(recipeData => {
                            if (!recipeData) {
                                res.status(404).send({ message: 'recipeId not found in database..' })
                            }
                            else {
                                if (status === "isDeleted" && recipeData.isDeleted === false) {
                                    Recipes.findByIdAndUpdate({ _id: recipeId }, deleteData, { new: true }, (error, deletedData) => {
                                        if (!deletedData) {
                                            res.status(404).send('deleted recipe not found..')
                                        }
                                        else {
                                            res.status(200).send({
                                                message: "recipe deleted successfully"
                                            });
                                        }
                                    })
                                }
                                else if (status === "isDeleted" && recipeData.isDeleted === true) {
                                    res.status(200).send({ message: "recipe already deleted" });
                                }
                                else if (status === "approved" && recipeData.status === 'approved') {
                                    res.send({ message: 'already approved' })
                                }
                                else if (status === 'approved' && (recipeData.status === 'pending' || 'draft' || 'unapproved')) {
                                    changeRecipeStatus(recipeId, statusObj).then(result => {
                                        res.status(200).send({
                                            message: "recipe status approved successfully..",
                                            result
                                        })
                                    }).catch(err => {
                                        res.status(400).send({ message: err.message })
                                    })
                                }
                                else if (status === "unapproved" && recipeData.status === 'approved') {
                                    changeRecipeStatus(recipeId, statusObj).then(result => {
                                        res.status(200).send({
                                            message: "recipe status unapproved successfully..",
                                            result
                                        })
                                    }).catch(err => {
                                        res.status(400).send({ message: err.message })
                                    })
                                }
                                else if (status === "unapproved" && (recipeData.status === 'pending' || recipeData.status === 'draft')) {
                                    res.send({ message: 'recipe not unapproved .firtly recipe should be approved.' })
                                }
                                else if (status === "unapproved" && recipeData.status === 'unapproved') {
                                    res.send({ message: 'recipe already unapproved ' })
                                }
                                else if (status === "draft" && recipeData.status === 'pending') {
                                    changeRecipeStatus(recipeId, statusObj).then(result => {
                                        res.status(200).send({
                                            message: "recipe drafted successfully..",
                                            result
                                        })
                                    }).catch(err => {
                                        res.status(400).send({ message: err.message })
                                    })
                                }
                                else if (status === "draft" && recipeData.status === 'draft') {
                                    res.send({ message: 'recipe already drafted.' })
                                }
                                else if (status === "draft" && (recipeData.status === 'approved' || 'unapproved')) {
                                    res.send({ message: 'recipe not drafte because its status approved.' })
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

    }
}

exports.updateRecipes = async (req, res) => {
    try {
        const body = req.body;
        // const userId = body.userId;
        const categoryId = body.categoryId;
        const recipeId = req.query.id;
        const recipes = {
            userId: body.userId,
            categoryId: body.categoryId,
            cookTime: body.cookTime,
            prepTime: body.prepTime,
            title: body.title,
            description: body.description,
            image: req.files.image[0].path,
            video: req.files.video[0].path,
        };
        if (!ObjectId.isValid(recipeId) && !ObjectId(recipeId)) {
            res.status(400).send({ message: "please insert valid recipeId" })
        }
        // if (!ObjectId.isValid(userId) && !ObjectId(userId)) {
        //     res.status(400).send({ message: "please insert valid userId" })
        // }
        else if (!ObjectId.isValid(categoryId) && !ObjectId(categoryId)) {
            res.status(400).send({ message: "please insert valid categoryId" })
        }
        else {
            await Recipes.findById(recipeId).then(recipeData => {
                if (!recipeData) {
                    res.status(404).send({ message: "recipe not found in database.." })
                } else {
                    // User.findById(userId).then(userData => {
                    //     if (!userData) {
                    //         res.status(404).send({ message: "user not found." })
                    //     } else {
                    //         recipes.userId = userData._id
                            Category.findById(categoryId).then(categoryData => {
                                if (!categoryData) {
                                    res.status(404).send({ message: "category not found in database." })
                                } else {
                                    recipes.categoryId = categoryData._id
                                    Recipes.findByIdAndUpdate(recipeId, recipes, { new: true }).select("-password").then(updatedRecipe => {
                                        res.status(200).send({ message: "Recipe updated successfully..", updatedRecipe: updatedRecipe })
                                    }).catch(err => {
                                        res.status(400).send({ message: err.message})
                                    })
                                }
                            // }).catch(err => { res.status(400).send({ message: err.message }) })
                        // }
                        
                    }).catch(err => {
                        res.status(400).send({ message: err.message })
                    })
                }
            }).catch(err => {
                res.status(400).send({ message: err.message })
            })
        }
    } catch (err) {
        res.status(400).send({ message:"image or video should not be empty" })
    }
}


exports.visitedRecipeNumberOfTime = async (req,res)=>{
    try{
      const recipeId = req.query.recipeId ;
      var count = 0
      var updateData ={
        visitedNumberOfTime : ""
      };
      if (!ObjectId.isValid(recipeId) && !ObjectId(recipeId)) {
        res.status(400).send({ message: "recipeId not valid" });
      }
      if(!recipeId){
        res.status(400).send({
          message:"recipe id is required "
        })
      }else{
        await Recipes.findById(recipeId).then(preData=>{
         if(!preData){
          res.status(200).send({
            message:"Recipe is not there "
         })
         }else{
           count = preData.visitedNumberOfTime;
            updateData.visitedNumberOfTime = count + 1
            Recipes.findByIdAndUpdate(recipeId,updateData,{new:true},(error , updatedData)=>{
              if(error){
                res.status(400).send({
                  message:"not visited",
                  subError:error.message
                })
              }else{
                if(!updatedData){
                  res.status(200).send({
                     message:"Recipe is not there for visit"
                  })
                }else{
                  res.status(200).send({
                    message:"Recipe is not there for visit",
                    data:updatedData
                 })
                }
              }
          })

         }
        }).catch(error=>{
          res.status(400).send({
            message:"no previous data found",
            subError:error.message
          })
        })
      }
   
    }catch(error){
      res.status(400).send({
        message:"Oops! something went wrong in visit",
        subError : error.message
      })
    }
  }

async function changeRecipeStatus(id, recipObj) {
    var result;
    await Recipes.findByIdAndUpdate({ _id: id }, recipObj, { new: true }).then(updatedData => {
        if (!updatedData) {
            result = { message: "recip not found." }
        } else {
            result = updatedData
        }
    })
    return result
}

async function paginations(pagesInfoArray) {
    var limit, skip;
    var a = [];
    var pageNo;
    for (var i = 0; i < pagesInfoArray.length; i++) {
        limit = pagesInfoArray[i].limitValue,
            skip = pagesInfoArray[i].skipValue
        pageNo = pagesInfoArray[i].pageNo

        await Recipes.find().then((recipeData) => {
            a.push({ pageNo: pageNo, pageContent: recipeData.slice(skip, limit) })
        }).catch(err => {
            res.status(400).send({ message: err.message })
        })
    }
    return a;
}


exports.searchRecipes = async (req,res) => {
    try{
        let data = await Recipes.find({
            "$or":[
                {cookTime:{$regex : req.query.key}},
                {prepTime:{$regex : req.query.key}},
                {title:{$regex : req.query.key}},
                {description:{$regex : req.query.key}}
            ]
        }); 
        res.status(200).send(data)
    }catch(err){
        res.status(400).send({message:err.message})
    }
}