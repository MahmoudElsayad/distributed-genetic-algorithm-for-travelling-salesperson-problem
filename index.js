var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 3000;
var io = require('socket.io')(server);
var JSONStream = require('JSONStream');
var fs = require('fs');
var util = require('util');
var iteration = 0;
var bestPath = {
  "distance": 99999999999999,
  "bestPath": []
};


server.listen(port, function(){
    console.log("Server started on port : " + port);
    var bestRead = JSON.parse(fs.readFileSync('js/data/bestPath.json'));
    console.log(bestRead.bestPath.length);
    if (bestRead.bestPath.length == 46) {
      bestPath = bestRead;
    }
});

app.use(express.static(__dirname));

app.get('/', function(request, response){
  response.sendFile(__dirname + '/index.html');
});

var connectedUsers = 0 ;

io.on('connection', function(socket){
  console.log("User Connected, and it's socket's id is: " + socket.id);
  connectedUsers++;

  io.emit('bestResultSoFar',bestPath);

  var contents = fs.readFileSync('js/data/cities.json', 'utf8');
  io.emit('cities', contents);

  io.emit('connectedUsers', connectedUsers);
  console.log('connectedUsers : ' + connectedUsers);
  // socket.on('bitwiseOp.message', function(seq){
  //
  //   var input = seq.split("\n");
  //   console.log('Received input from client ' + socket.id);
  //   if (input[0].length < input[1].length) {
  //     var temp = input[0];
  //     input[0] = input[1];
  //     input[1] = temp;
  //   }
  //   io.emit('bitwiseOp.result', hydroGene(input[0],input[1]));
  //
  //   // io.emit('alignment.error', "Error Occured");
  //   // console.log("Emitted Results to socket "+ socket.id);
  // });

  socket.on('bestPath', function(data){
    if (bestPath.distance > data.distance ) {
      bestPath = data;
      console.log("new minimal distance: " + bestPath.distance);
      io.emit('bestNewPath',bestPath.bestPath);
    }
  });

  socket.on('checkPath', function(){
    io.emit('checkedPath',bestPath.bestPath);
  })

  socket.on('disconnect', function(){
    console.log("User on socket " + socket.id + " disconnected.");
    connectedUsers--;
    io.emit('connectedUsers', connectedUsers);
    console.log('connectedUsers : '+ connectedUsers);
    fs.writeFileSync("js\\data\\bestPath.json", JSON.stringify(bestPath),'utf8');

  socket.on('bestEver', function(bestEver){
    fs.writeFile('bestEver.txt',bestEver);
  });

  socket.on('result', function(paths){
    console.log("received: " + paths[0]);
  })
  });

});
