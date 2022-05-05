const jwt = require('jsonwebtoken')
const secrte = process.env.SECRTE
exports.verifyToken =(req,res,next)=>{
    let token = req.headers["x-access-token"];
    if(!token){
        res.status(403).send({message:"please provide token"})
    }
    else{
        jwt.verify(token,secrte,(err)=>{
            if(err){
            res.status(401).send({message: "Please Provide Valid Token!"});
            }
            else{
                next(); 
            }
        });
    }
    
}

