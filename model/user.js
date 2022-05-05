const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var User = mongoose.Schema({
    roleId: { type: Schema.Types.ObjectId,ref:'roles'},
    firstName: { type: String, required: [true , "please Enter FirstName"] },
    lastName: { type: String, required:[true , "please Enter LastName"] },
    email: { type: String ,required:[true , "please Enter Email"],unique:true},
    phone: { type: Number ,required:[true , "please Enter Phone number"]},
    password: { type: String },
    isLoginEnable: { type: Boolean ,default:0},
    Image:{ type: String ,required:[true , "please upload image"] },
    status:{ type: String , default:"pending" },
    isDeleted:{ type: Boolean ,default:0},
    DeletedBy:{ type: Schema.Types.ObjectId,ref:'UserDetails' },
    resetToken: String,
    expireToken: Date,
},
{
    timestamps: true
});

var user = mongoose.model("UserDetails", User);
module.exports = user;
