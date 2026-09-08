const http = require('http');
const net = require('net');

const NEON_HOST = 'ep-dark-river-aerzg6ls-pooler.c-2.us-east-2.aws.neon.tech';
const NEON_PORT = 5432;

let lastResult = { status: 'not tested yet' };

function testConnection() {
  const startedAt = new Date().toISOString();
  const socket = new net.Socket();
  const timeoutMs = 8000;

  socket.setTimeout(timeoutMs);

  socket.once('connect', () => {
    lastResult = {
      status: 'SUCCESS',
      message: `Connected to ${NEON_HOST}:${NEON_PORT}`,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    console.log('[test]', JSON.stringify(lastResult));
    socket.destroy();
  });

  socket.once('timeout', () => {
    lastResult = {
      status: 'TIMEOUT',
      message: `Connection to ${NEON_HOST}:${NEON_PORT} timed out after ${timeoutMs}ms`,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    console.log('[test]', JSON.stringify(lastResult));
    socket.destroy();
  });

  socket.once('error', (err) => {
    lastResult = {
      status: 'ERROR',
      message: err.message,
      code: err.code,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    console.log('[test]', JSON.stringify(lastResult));
  });

  socket.connect(NEON_PORT, NEON_HOST);
}

// Run a test immediately on boot, then every 60 seconds.
testConnection();
setInterval(testConnection, 60000);

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ target: `${NEON_HOST}:${NEON_PORT}`, lastResult }, null, 2));
});

const port = process.env.PORT || 10000;
server.listen(port, () => {
  console.log(`Network test service listening on port ${port}`);
});
