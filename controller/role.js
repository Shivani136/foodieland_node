const Role = require('../model/role');

exports.Roles = async (req,res) =>{
    var body = req.body
    console.log(body)
    if(Object.keys(body).length === 0 && body.constructor === Object){
        res.status(400).send({message:"data not proper formated..."})
    }

    else{
        const roleDetails = new Role(body)
        await roleDetails.save()
        .then((roleData)=>{
            res.status(200).send(roleData)
        }).catch(err=>{
            res.status(400).send({message:err.message})
        })
    }
}

exports.getAllRoles= async (req, res) => {
    var a ;
  await  Role.find()
        .then(data => {
            
            res.status(200).send(data)
            a = data;
          
        })
        .catch(err => {
            res.status(400).send({ message: err.message })
        })
        console.log(a)
        return a;
       
}