require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

// Prevent crashes from unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at', promise, 'reason:', reason);
});

const app = express();
const PORT_START = parseInt(process.env.PORT || '3456', 10);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  process.env.CORS_ORIGIN,
].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Clinic API</title></head><body>' +
    '<h1>Patient Management API</h1><p>Server is running.</p>' +
    '<p>Use <a href="http://localhost:5173">http://localhost:5173</a> for the app.</p>' +
    '</body></html>'
  );
});
app.use('/api', routes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.use(errorHandler);

// Try ports until one is free (3456, 3457, ... 3465)
function tryListen(port) {
  if (port > PORT_START + 10) {
    console.error(`No free port between ${PORT_START} and ${PORT_START + 10}. Stop other processes or set PORT in .env`);
    process.exit(1);
  }
  const server = app.listen(port, '0.0.0.0')
    .on('listening', () => {
      console.log(`Patient management server running at http://localhost:${port}`);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} in use, trying ${port + 1}...`);
        tryListen(port + 1);
      } else {
        console.error(err);
        process.exit(1);
      }
    });
}

tryListen(PORT_START);
