//This code requires mongoose node module
const mongoose = require('mongoose');

//connecting local mongodb database named test
const db = mongoose.connect('mongodb://127.0.0.1:27017/test');

//testing connectivity
mongoose.connection.once('connected', function() {
    console.log("Database connected successfully")
});