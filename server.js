const express = require('express');  // Expres module include
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/authRoutes')

const app = express(); // instance of express application

app.use(express.json());  // Middleware to convert req into json format
app.use(cookieParser());
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