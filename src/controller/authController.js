const { request } = require('express');
const jwt = require('jsonwebtoken');
const secret = "6aaae49a-1904-4b23-94c0-21f868d3f0ad";
const Users = require('../model/User')
const bcrypt = require('bcryptjs')

const authController = {
    login : async (request, response) => {
        //these values are here beacause of express.json() middleware;

        try{
            const {username, password} = request.body;

            const data = await Users.findOne({email: username})
            if(!data){
                return response.status(401).json({message: 'Invalid Credentials'});
            }

            const isMatch = await bcrypt.compare(password, data.password)
            if(!isMatch){
                return response.status(401).json({message: 'Invalid'});
            }

            const userDetails = {
                id: data._id,
                name: data.name,
                email: data.email
            }
            const token = jwt.sign(userDetails, secret, {expiresIn: '1h'});

            response.cookie('jwtToken', token,{
                httpOnly : true,
                secure : true,
                domain : 'localhost',
                path : '/'
            })
            response.status(200).json({message:'User Authenticated', userDetails:userDetails})

            
            // if(username === 'admin' && password === 'admin'){
            //     const userDetails = {
            //         name : "John Cena",
            //         email : "John@email.com"
            //     }
    
    
    
            // }
            // else{
            //     response.status(401).json({message : 'Invalid credentials'});
            // }

        } catch(error){
            console.log(error);
            response.status(404).json({message : "Invalid"});
        }

    },
    logout : (request,response) => {
        response.clearCookie('jwtToken');
        response.json({message : 'User logged out'});
    },
    isUserLoggedIn : (request,response) => {
        const token = request.cookies.jwtToken;
 
        if(!token){  // if token is present or not
            response.status(401).json({message : 'Unauthorized Access'});
        }
        
        jwt.verify(token, secret, (error, decodedSecret) => {  //verifing if token in valid
            if(error){
                response.status(401).json({message : 'Unauthorized Access'});
            }
            else{
                return response.json({userDetails : decodedSecret})
            }
        })
    }
}

module.exports = authController;