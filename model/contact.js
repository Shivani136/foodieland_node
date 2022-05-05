const mongoose = require('mongoose');

var contactPageSchema = mongoose.Schema({
    name: { type: String, required: [true, "please Enter Name"] },
    subject: { type: String, required: [true, "please Enter Subject"] },
    email: { type: String, required: [true, "please Enter Email"], unique: true },
    enquiryType: { type: String, required: [true, "please Select enquiryType"] },
    message: { type: String },
},
    {
        timestamps: true
    });

var Contact = mongoose.model("ContactDetails", contactPageSchema);
module.exports = Contact;
