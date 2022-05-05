const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipes = new Schema({
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipes'},
    nutritionInformation :{
        calories: { type: String },
        totalFat: { type: String },
        protein: { type: String },
        carbohydrate: { type: String },
        cholesterol: { type: String },
        nutritionTitle: { type: String }
    },
    ingredient:  { type: Array },
    direction: [{
        directionTitle: { type: String },
        directionDescription: { type: String },
        directionImage:{ type: String }
    }],
    visitedNumberOfTime :{type :Number , default:0}
    }
    
    ,
    {
        timestamps: true
    });

var RecipesMeta = mongoose.model("Recipes-Meta", recipes);
module.exports = RecipesMeta;
