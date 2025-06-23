require('dotenv').config();
const express = require('express');  // Expres module include
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes')
const mongoose = require('mongoose');

const app = express(); // instance of express application

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("database connected");
})
.catch((error)=>{
    console.log(error);
})

app.use(express.json());  // Middleware to convert req into json format
app.use(cookieParser());

const corsOptions = {   // from where to except request
    origin : process.env.CLIENT_ENDPOINT,
    credentials : true
};
app.use(cors(corsOptions));

app.use('/auth',authRoutes);

const PORT = 5000;
app.listen(PORT,(error) => {  // server started
    if(error){
        console.log(`server not started: ${error}`);
    }
    else{
        console.log(`server is running on http://localhost:${PORT}`);
    }
});