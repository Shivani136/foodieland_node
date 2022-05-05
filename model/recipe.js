const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipes = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'UserDetails' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'category' },
    cookTime: { type: String, required: [true, "please Insert Cook time"] },
    prepTime: { type: String, required: [true, "please Insert prep time"] },
    title: { type: String, required: [true, "please Insert title"] },
    description: { type: String, required: [true, "please Insert description"] },
    image: { type: String, required: [true, "please upload Image"] },
    video: { type: String, required: [true, "please upload video"] },
    // nutritionInformation: {
    //     calories: { type: String },
    //     totalFat: { type: String },
    //     protein: { type: String },
    //     carbohydrate: { type: String },
    //     cholesterol: { type: String },
    //     nutritionTitle: { type: String }
    // },
    // ingredient:  { type: Array },
    //  direction: [{
    //     directionTitle: { type: String },
    //     directionDescription: { type: String },
    //     directionImage:{ type: String }
    // }],
    status: { type: String, default: "pending" },
    isDeleted: { type: Boolean, default: 0 },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'UserDetails' },
},
    {
        timestamps: true
    });

var Recipes = mongoose.model("Recipes", recipes);
module.exports = Recipes;
