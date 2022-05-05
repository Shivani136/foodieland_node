const Recipes = require('../model/recipe');
const RecipesMeta = require('../model/recipe_meta');
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

exports.createRecipeMeta = async (req, res) => {
    const body = req.body;
    const recipeId = body.recipeId;
    const recipes = new RecipesMeta({
        recipeId: body.recipeId,
        nutritionInformation: body.nutritionInformation,
        ingredient: body.ingredient,
        direction: body.direction
    });
    var directionImage = [];
    for (var i = 0; i < req.files.length; i++) {
        var fieldname = req.files[i].fieldname
        recipes[fieldname] = req.files[i].path
        if (i >= 0) {
            directionImage.push(req.files[i].path)
        }
    }
    for (var k = 0; k < recipes.direction.length; k++) {
        recipes.direction[k]['directionImage'] = directionImage[k]
    }
    if (Object.keys(body).length === 0 && body.constructor === Object) {
        res.status(400).send({ message: "Data Not Proper Formated..." })
    }
    if (!ObjectId.isValid(recipeId) && !ObjectId(recipeId)) {
        res.status(400).send({ message: "please insert valid recipeId" })
    }
    else {
        Recipes.findById(recipeId).then(recipeData => {
            if (!recipeData) {
                res.status(404).send({ message: "recipeId not found in database.." })
            } else {
                recipes.save().then((recipedata) => {
                    if (!recipedata) {
                        res.status(400).send({ message: "recipeMetaData not added." })
                    } else {
                        res.status(200).send({ message: "recipemeta data added successfully..", data: recipedata })
                    }
                }).catch(err => {
                    res.status(400).send({ message: err.message })
                })
            }
        }).catch(err => {
            res.status(400).send({ message: err.message })
        })
    }
}

exports.getAllRecipe = async (req, res) => {
    try {
     

        const limitValue = req.query.limit || 5;
        const skipValue = req.query.skip || 0;
        RecipesMeta.find()
            .limit(limitValue).skip(skipValue)
            .populate({ path: "recipeId", populate: [{ path: 'userId' }, { path: 'categoryId' }] })
            .then((blogData) => {
                res.status(200).send(blogData)
            }).catch(err => {
                res.status(400).send({ message: err.message })
            })





        // RecipesMeta.find()
        //     .populate({ path: "recipeId", populate: [{ path: 'userId' }, { path: 'categoryId' }] })
        //     .then((blogData) => {
        //         res.status(200).send(blogData)
        //     }).catch(err => {
        //         res.status(400).send({ message: err.message })
        //     })



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
        // RecipesMeta.find()
        //     .then(data => {
        //         console.log("data ====")
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
        res.status(400).send({ message: err.message });
    }
}
async function paginations(pagesInfoArray) {
    var limit, skip;
    var a = [];
    var pageNo;
    for (var i = 0; i < pagesInfoArray.length; i++) {
        limit = pagesInfoArray[i].limitValue,
            skip = pagesInfoArray[i].skipValue
        pageNo = pagesInfoArray[i].pageNo

        await RecipesMeta.find().populate({path:"recipeId" ,populate:[{path:'userId'},{path:'categoryId'}]}).then((recipeData) => {
            a.push({ pageNo: pageNo, pageContent: recipeData.slice(skip, limit) })
        }).catch(err => {
            res.status(400).send({ message: err.message })
        })
    }
    return a;
}

exports.getOneRecipes = (req, res) => {
    try {
        const recipeId = req.query.id;
        if (!ObjectId.isValid(recipeId) && !ObjectId(recipeId)) {
            res.status(400).send({ message: "please insert valid recipeId" })
        } else {
            RecipesMeta.findById(recipeId)
                .populate({ path: "recipeId", populate: [{ path: 'userId' }, { path: 'categoryId' }] })
                .then((response) => {
                    if (!response) {
                        res.status(200).send({ message: "recipeId Not Found in database.." });
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

exports.deleteRecipeMeta = async (req, res) => {
    try {
        const recipeMetaId = req.query.id;
        if (!ObjectId.isValid(recipeMetaId) && !ObjectId(recipeMetaId)) {
            res.status(400).send({ message: "please insert valid recipeId" })
        } else {
            RecipesMeta.findById(recipeMetaId).then(metaData => {
                if (!metaData) {
                    res.status(404).send({ message: "recipe metaId not found in database." })
                } else {
                    RecipesMeta.findByIdAndRemove(recipeMetaId, function (err, docs) {
                        if (err) {
                            res.status(400).send({ message: err.message })
                        }
                        else {
                            res.status(200).send({ message: "Removed recipe meta : ", docs });
                        }
                    });
                }
            }).catch(err => {
                res.status(400).send({ message: err.message })
            })
        }

    } catch (err) {
        res.status(400).send({ message: err.message })
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
        await RecipesMeta.findById(recipeId).then(preData=>{
         if(!preData){
          res.status(200).send({
            message:"Recipe is not there "
         })
         }else{
           count = preData.visitedNumberOfTime;
            updateData.visitedNumberOfTime = count + 1
            RecipesMeta.findByIdAndUpdate(recipeId,updateData,{new:true},(error , updatedData)=>{
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