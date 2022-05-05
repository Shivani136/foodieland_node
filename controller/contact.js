const Contact = require('../model/contact');
const mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId


exports.createContactPage = async(req,res) =>{
    try{
        var body = req.body
    console.log(body)
    if(Object.keys(body).length === 0 && body.constructor === Object){
        res.status(400).send({message:"data not proper formated..."})
    }
    else{
        const contactDetails = Contact(body)
        await contactDetails.save()
        .then((contactDetails)=>{
            res.status(200).send(contactDetails)
        }).catch(err=>{
            res.status(400).send({message:err.message})
        })
    }
    }catch(err){
        res.status(400).send({message:err.message})
    }
}