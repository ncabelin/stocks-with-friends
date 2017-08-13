var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('static'));
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
  socket.on('add stock', function(stock) {
    console.log('adding ' + stock);
    io.emit('add stock', stock);
  });
});

http.listen(3000, function() {
  console.log('listenting on :3000 fucker!');
});
