const mongoose = require('mongoose');

var emailSchema = mongoose.Schema({
  subscribeUserId:{type:String},
  email_address:{ type: String ,required:[true , "please Enter Email"]},
  status:{type:String}
},
    {
        timestamps: true
    });

var SubscribeEmail = mongoose.model("subscribedUser", emailSchema);
module.exports = SubscribeEmail;
