var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

require('dotenv').config();
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
  res.send('/index.html');
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

http.listen(process.env.PORT || 3000, process.env.IP, function() {
  console.log('started server');
});
