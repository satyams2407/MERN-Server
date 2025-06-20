const { request } = require('express');
const jwt = require('jsonwebtoken');
const secret = "6aaae49a-1904-4b23-94c0-21f868d3f0ad";

const authController = {
    login : (request, response) => {
        //these values are here beacause of express.json() middleware;
        const {username, password} = request.body;

        if(username === 'admin' && password === 'admin'){
            const userDetails = {
                name : "John Cena",
                email : "John@email.com"
            }
            const token = jwt.sign(userDetails, secret, {expiresIn: '1h'});

            response.cookie('jwtToken', token,{
                httpOnly : true,
                secure : true,
                domain : 'localhost',
                path : '/'
            })

            response.status(200).json({message:'User Authenticated', userDetails:userDetails})
        }
        else{
            response.status(401).json({message : 'Invalid credentials'});
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
        
        jwt.verify(token, secret, (error, decodedSecret) => { //verifing if token in valid
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