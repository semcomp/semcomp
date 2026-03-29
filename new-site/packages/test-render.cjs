const http = require('http');
http.get('http://localhost:5174/', (res) => {
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => console.log(rawData));
});
