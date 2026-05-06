const express = require('express');
const app = express();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Express minimal server' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, HOST, () => {
  console.log(`✅ Minimal server listening on ${HOST}:${PORT}`);
  console.log(`Process uptime: ${process.uptime()}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  process.exit(0);
});
