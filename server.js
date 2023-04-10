const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

http.listen(3000, () => {
  console.log('Server listening on port 3000...');
});

let latestResponse = 'No Response';

app.post('/api/watchtower', (req, res) => {
  const responseData = req.body;
  latestResponse = responseData;
  res.send('Response received');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('Socket connection established');

  socket.emit('latestResponse', latestResponse);
});
