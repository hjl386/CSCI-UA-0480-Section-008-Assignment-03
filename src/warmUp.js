// warmUp.js

const net = require('net');
const [HOST, PORT] = ['127.0.0.1', 8080];

const server = net.createServer((sock) => {
	console.log(sock.remoteAddress, sock.remotePort);
	sock.write('HTTP/1.1 200 OK\r\nContent-Type:text/html\r\n\r\n <em>Hello </em><strong>World</strong>');	
	sock.end();
});

server.listen(PORT, HOST);
