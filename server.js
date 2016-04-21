'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var validUrl = require('valid-url');
var MongoClient = require('mongodb').MongoClient;
var db;
var collection;
var count = 0;


var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

MongoClient.connect("mongodb://localhost:27017/database", function(err, database) {
  if(err) throw err;

  db = database;
  
  db.collection('urls').drop();
  collection = db.collection('urls');
  
  // Start the application after the database connection is ready
  app.listen(3000);
  console.log("Listening on port 3000");
});


app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

app.use(function(req, res) {
  
  
  if (validUrl.isUri(req.url.substr(1)))
  {
  	
   collection.insert({short: count + '', url: req.url.substr(1)}, function(err, result) {
    if (err) return
    count++;
     
   })

  	
  	res.send({"short" : count,  "url" : req.url.substr(1)});
  }
  
  else 
  {
  
  collection.find({short : req.url.substr(1)}).toArray(function(err, docs) {
      
      if(err) return
      
      
      if(!docs[0])
      {
        res.send("Not Found");
      }
      else
      {
      res.redirect(docs[0].url);
      }
    
  
  });
  }
  
  // else
  // {
  //   	res.send({"error:" : "URL not in correct format"});
  // }
  
});

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});