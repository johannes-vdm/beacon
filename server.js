const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Set up the middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Set up the server to listen on the port provided by Heroku or 3000
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});

// Set up a variable to store the latest response
let latestResponse = 'No Response';

// Set up a route to handle post requests to /api/watchtower
app.post('/api/watchtower', (req, res) => {
  const responseData = req.body;
  latestResponse = responseData;
  io.emit('latestResponse', latestResponse); // Push the latest response to all connected clients
  res.send('Response received');
});

// Set up Socket.io to update the HTML page without refreshing
io.on('connection', (socket) => {
  console.log('Socket connection established');

  // Send the latest response to the client on connection
  socket.emit('latestResponse', latestResponse);
});
