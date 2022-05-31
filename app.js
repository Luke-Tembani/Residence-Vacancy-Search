const express = require('express');
const path = require('path');
const session = require('express-session');
const  fileupload = require('express-fileupload');
const pageRouter = require('./routes/pages');
const app = express();

app.use(session({
    secret: 'mysecret',
    sameSite:true,
    resave: true,
    saveUninitialized:true,
    cookie:{}
}))


//for body parser
app.use(express.urlencoded({extended: true}));//parse urlencoded bodies as sent by html forms
app.use(express.json());  //parse urlencoded bodies as sent by API Clients

//serve static files

app.use(express.static(path.join(__dirname, './public')));
app.use(express.static(path.join(__dirname, './files')));


//template engine

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//routers 

app.use('/', pageRouter);

//setting server

app.listen(5000, ()=>{
    console.log('Listening on port 5000');
});