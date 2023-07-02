const jwt = require('jsonwebtoken')

const generateToken=(id)=>{
    return jwt.sign({id} , process.env.JWT,{
        expiresIn : '365d'
    });

};
module.exports = generateToken;