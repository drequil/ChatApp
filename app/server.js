/* Setup:
 * npm install --save @google-cloud/datastore
 * npm install --save express body-parser nodemon morgan
 * npm install -g nodemon
 * 

var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan')

/* custom code */
var chat = require('./function').chat
var chats = require('./function').chats

var app = express();
var port = parseInt(process.env.PORT, 10) || 3000;
app.use(logger('dev'));
// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/chat/', chat) 
app.get('/chat/:id', chat)
app.get('/chats/:username', chats)

app.listen(port, function () {
//app.listen(8080, function () {
    console.log('\nApp running on port: ', port)
});

