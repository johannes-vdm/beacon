const express = require('express');
const app = express();
const path = require('path');

// Set a 30-minute timeout for the response
const TIMEOUT = 30 * 60; // 30 minutes in milliseconds

// Keep track of connected clients
const clients = new Set();

// Initialize watchtowerData to an empty object
app.locals.watchtowerData = {};

// Endpoint for receiving data from Python server
app.post('/api/forward', (req, res) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });

  req.on('end', () => {
    // Save the data to be sent to connected clients
    app.locals.watchtowerData = JSON.parse(data);
    // Send a 200 OK response
    res.sendStatus(200);
  });
});

// Endpoint for serving the HTML page with the latest JSON response
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Beacon App</title>
      </head>
      <style>
        body {
          background-color: black;
          color: white;
          font-family: 'Courier New', Courier, monospace;
        }
      </style>
      <body>
        <h1 id="data"></h1>
        <script>
          const source = new EventSource('/watchtower');
          const pre = document.getElementById('data');
          source.addEventListener('message', event => {
            pre.textContent = event.data;
          });
        </script>
      </body>
    </html>
  `;
  res.send(html);
});

// Endpoint for serving the data received from Python server as server-sent events
app.get('/watchtower', (req, res) => {
  // Set the headers for server-sent events
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Add the client to the set of connected clients
  clients.add(res);

  // Send the current data to the client
  if (app.locals.watchtowerData) {
    res.write(`data: ${JSON.stringify(app.locals.watchtowerData)}\n\n`);
  }

  // Remove the client from the set of connected clients when the connection is closed
  req.on('close', () => {
    clients.delete(res);
  });
});

// Start the server
const server = app.listen(3000, () => console.log('Watchtower app listening on port 3000!'));

// Set a 30-minute timeout for the response
app.use((req, res, next) => {
  res.setTimeout(TIMEOUT, () => {
    // Send a 404 Not Found response if the timeout expires
    res.sendStatus(404);
  });
  next();
});

// Send the current data to all connected clients every second
setInterval(() => {
  if (app.locals.watchtowerData) {
    clients.forEach(client => {
      client.write(`data: ${String(app.locals.watchtowerData.data)}\n\n`);
    });
  }
}, 1000);
