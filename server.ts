import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import socketIO from 'socket.io';
import { Server } from "socket.io";
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set up the middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Set up the server to listen on the port provided by Heroku or 3000
const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});

// Set up a variable to store the latest response
let latestResponse: string = 'No Response';

// Set up a route to handle post requests to /api/watchtower
app.post('/api/watchtower', (req: express.Request, res: express.Response) => {
  const responseData: any = req.body;
  latestResponse = responseData;
  io.emit('latestResponse', latestResponse); // Push the latest response to all connected clients
  res.send('Response received');
});

// Set up Socket.io to update the HTML page without refreshing
io.on('connection', (socket: socketIO.Socket) => {
  console.log('Socket connection established');

  // Send the latest response to the client on connection
  socket.emit('latestResponse', latestResponse);
});