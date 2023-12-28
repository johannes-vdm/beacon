<a href="https://github.com/johannes-vdm/express-beacon" target="_blank">View Source Code</a>

![MarineGEO circle logo](public/beacon.png)

This documentation provides an overview of the Node.js code that uses the Express framework, the Socket.IO library, and the Body-Parser middleware to set up a server that can handle post requests to an API endpoint. The server sends real-time updates to connected clients using Socket.IO.

## Dependencies
- Express
- Body-Parser
- Socket.IO
- Typescript 
  
## Routes
<a href="">`/api/watchtower`</a>

## Code Review
The code starts by importing the required modules:
```ts
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import socketIO from 'socket.io';
import { Server } from "socket.io";
```

It then creates an instance of the Express application:

```ts
const app = express();
```

Next, it creates an instance of the HTTP server using the Express application:
```ts
const server = http.createServer(app);
```

It then creates an websocket, using the Socket.IO server using the HTTP server:
```ts
const io = new Server(server);
```

The code then sets up the middleware for the server:
```ts
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
```

The server is set up to listen on a specified port:

```ts
const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
```
A variable called `latestResponse` is set up to store the latest response from the API endpoint:

```ts
let latestResponse: string = 'No Response';

```

A route is set up to handle post requests to the /api/watchtower endpoint. The latest response is saved to the latestResponse variable, and then sent to all connected clients using Socket.IO:

```ts
app.post('/api/watchtower', (req: express.Request, res: express.Response) => {
  const responseData: any = req.body;
  latestResponse = responseData;
  io.emit('latestResponse', latestResponse); // Push the latest response to all connected clients
  res.send('Response received');
});
```
The Request and Response interfaces from the express module are used to handle incoming requests and send responses. The latest response is saved to the latestResponse variable, and then sent to all connected clients using Socket.IO.

The Socket interface from the socket.io module is used to handle real-time communication between the server and connected clients. When a client connects to the server, the latestResponse is sent to the client.
```ts
io.on('connection', (socket: socketIO.Socket) => {
  console.log('Socket connection established');

  // Send the latest response to the client on connection
  socket.emit('latestResponse', latestResponse);
});
```
