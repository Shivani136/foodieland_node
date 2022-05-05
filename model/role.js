var mongoose = require('mongoose');

const role = mongoose.Schema({
    roleName:{type:String },
});

var Role = mongoose.model("roles",role);
module.exports = Role;