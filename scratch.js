const https = require('https');
const http = require('http');

http.get('http://darpan360.in', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n');
    lines.forEach((line, idx) => {
        if (line.toLowerCase().includes('favicon') || line.toLowerCase().includes('icon')) {
            console.log('Icon Element:', line.trim());
        }
        if (line.toLowerCase().includes('logo')) {
            console.log('Logo Element:', line.trim());
        }
    });
  });
}).on('error', err => {
  console.log('Error: ', err.message);
});
