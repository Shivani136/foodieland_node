const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var category = mongoose.Schema({
    categoryName: { type: String, required: [true, "please Enter Name"] },
    image: { type: String, required: [true, "please upload Image"] },
    isDeleted: { type: Boolean, default: 0 },
    DeletedBy: { type: Schema.Types.ObjectId, ref: 'UserDetails' },
},
    {
        timestamps: true
    });

var Category = mongoose.model("category", category);
module.exports = Category;
