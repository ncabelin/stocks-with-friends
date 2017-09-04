var express = require('express');
    app = express(),
    mongoose = require('mongoose'),
    http = require('http').Server(app),
    request = require('request'),
    io = require('socket.io')(http);

require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);
var stockSchema = new mongoose.Schema({
  name: String
});
var Stock = mongoose.model('Stock', stockSchema);

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
  res.render('index');
});

// get monthly stock data from alphavantage
app.get('/get_stock', function(req, res) {
  var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=' 
    + req.query.q + '&apikey=' + process.env.API_KEY
  request(url, function(error, response, body) {
    if (error) {
      res.status(400).json({message:'Error getting stock data'});
    } else {
      var b = JSON.parse(body);
      res.status(200).json(b);
    }
  });
});

// get array of stocks currently listed
app.get('/list_stocks', function(req, res) {
  Stock.find({}, function(err, stocks) {
    if (err) {
        console.log('Error : ' + err);
        res.status(400).json({message:'Error finding stocks'})
      } else {
        res.status(200).json(stocks);
      }
  });
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  // add stock
  socket.on('add stock', function(stock) {
    console.log('adding ' + stock);
    Stock.findOneAndUpdate({ name:stock }, {
      name: stock
    },{ upsert: true }, function(err, stk) {
      if (err) {
        console.log('Error : ' + err);
      } else {
        console.log('Recorded ' + stock);
      }
    });
    io.emit('add stock', stock);
  });

  // remove stock
  socket.on('remove stock', function(stock) {
    console.log('removing ' + stock);
    Stock.findOneAndRemove({name:stock}, function(err) {
      if (err) {
        console.log('Error : ' + err);
      } else {
        io.emit('remove stock', stock);
      }
    });
  });
});

http.listen(process.env.PORT || 3000, process.env.IP, function() {
  console.log('started server');
});
