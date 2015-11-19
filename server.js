//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var MongoClient = require('mongodb').MongoClient;


var mongoose = require('mongoose');
var mongoosedb = mongoose.createConnection(process.env.IP, "blahblah");
mongoosedb.on('error', console.error.bind(console, 'connection error:')); 

mongoosedb.once("on", function() {
  console.log("on");
});

//Change this to contestants votes
var voteSchema = new mongoose.Schema({
    kellyVotes: Number,
    carrieVotes: Number,
    jordinVotes: Number,
    jenniferVotes: Number
  });
var Votes = mongoosedb.model('Pri', voteSchema);

var db = null;
 


//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];

io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });
    
    socket.on('show', function() {
      //This is the function that sends stuff to the front end
      Votes.find({}, function(err, match) {
          
          if (err) return console.error(err);
          
          console.log(match);
          
          if (! match)
          {
            
            return;
          }
          
          var data = {};
          
          match = match[0];
          
          //Change these to data from database
          data.kellyVotes = match.kellyVotes;
          data.carrieVotes = match.carrieVotes;
          data.jordinVotes = match.jordinVotes;
          data.jenniferVotes = match.jenniferVotes;
          
          console.log(data);
          
          socket.emit('show', data);
        });
      
    });

    socket.on('vote', function (msg) {
      
      
      var kellyVotes = msg.kellyVotes;
      var carrieVotes = msg.carrieVotes;
      var jordinVotes = msg.jordinVotes;
      var jenniferVotes = msg.jenniferVotes;
      
      //Save all these to database
      
      Votes.remove({}, function(err) { 
       console.log('collection removed') 
        });
      
      var vote = new Votes({
        kellyVotes: kellyVotes,
        carrieVotes: carrieVotes,
        jordinVotes: jordinVotes,
        jenniferVotes: jenniferVotes
      });
      
      vote.save(function(err, miss) {
        if (err) return console.error(err);
      });

      
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
      });
    });
  });


function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
  
  Votes.remove({}, function(err) { 
   console.log('collection removed') 
    });
    
  var vote = new Votes({
    kellyVotes: 0,
    carrieVotes: 0,
    jordinVotes: 0,
    jenniferVotes: 0
  });
  
  vote.save(function(err, miss) {
    if (err) return console.error(err);
    });
  
  // console.log(JSON.stringify((musicData)));
  
  

});
