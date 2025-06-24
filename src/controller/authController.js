const { request } = require('express');
const jwt = require('jsonwebtoken');
const secret = "6aaae49a-1904-4b23-94c0-21f868d3f0ad";
const Users = require('../model/User')
const bcrypt = require('bcryptjs')
const {OAuth2Client} = require('google-auth-library')

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
    },
    register: async (request,response) => {
        try{
            const {username,password, name} = request.body;
            
            const data = await Users.findOne({email : username});
            console.log("data");
            console.log(data);
            if(data){
                return response.status(401).json({message : "Users already exist"});
            }
            
            const encryptedPassword = await bcrypt.hash(password,10);

            const user = new Users({
                email: username,
                password: encryptedPassword,
                name : name
            })
            await user.save();
            response.status(200).json({message : "User registered"});

        } catch(error){
            console.log(error);
            response.status(500).json({message: 'Internal server error'});
        }
    },
    googleAuth : async (request, response) => {
        const {idToken} = request.body
        if(!idToken){
            return response.status(400).json({message : "Invalid request"})
        }
        try{
            const gooleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            const response = await googleClient.verifyIdToken({
                idToken: idToken,
                audience: GOOGLE_CLIENT_ID
            });
            const payload = response.getPayLoad();
            const {sub:googleId, email, name} = payload;

            let data = await Users.findOne({email: email});
            if(!data){
                data = new Users({
                    email: email,
                    name: name,
                    isGoogleUser: true,
                    googleId : googleId
                });
                
            }
            await data.save();
            const user = {
                id:data._id ? data._id : googleId,
                username:email,
                name: name
            }
            const token = jwt.sign(user, secret,{expiresIn:'1h'});
            response.Cookie('jwtToken',token,{
                httpOnly: true,
                secure: true,
                domain:'localhost',
                path:'/'
            })
        } catch(error){

        }
        
    }
}

module.exports = authController;