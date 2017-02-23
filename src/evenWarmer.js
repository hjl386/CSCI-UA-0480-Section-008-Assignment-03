// evenWarmer.js
// create Request and Response constructors...

const net = require('net');
const [HOST, PORT] = ['127.0.0.1', 8080];

class Request{
	constructor(httpRequest){		
/*		let s = '';
		s += 'GET /foo.html HTTP/1.1\r\n';	//Request line
		s += 'Host: localhost:8080\r\n';	//Headers
		s += '\r\n\r\n';	//Empty Line to mark the boundary between the header and body */
		const path = httpRequest.split(' ')[1];
		this.path = path;
		const method = httpRequest.split(' ')[0];
		this.method = method;
		const headers = httpRequest.split('\r\n');
		const arrHeader = headers.map(cur => { return cur.split(' '); });
		for (let i = 1; i < arrHeader.length; i++){
			arrHeader[i][0] = arrHeader[i][0].slice(0, -1);
		}
		const objHeader = {};
		for (let i = 1; i < arrHeader.length; i++){
			if(arrHeader[i][1] !== undefined){
				objHeader[arrHeader[i][0]] = arrHeader[i][1];
			}
		}
		this.headers = objHeader;
		const body = httpRequest.split('\r\n\r\n')[1];
		this.body = body;	
	}
	
	toString(){
		let s = this.method + ' ' + this.path + ' HTTP/1.1\r\n';
		let counter = 0;
		let len = 0;
		for (const i in this.headers){
			if(this.headers.hasOwnProperty(i)){
				len++;
			}
		}
		for (const key in this.headers){
			if (this.headers.hasOwnProperty(key)){
				s += key + ": " + this.headers[key];
				counter++;
			}
			if (counter !== len){
				s += '\r\n';
			}
		}
		s += '\r\n\r\n' + this.body; 
		return s;
	}
}

class Response{
	constructor(socket){
		this.sock = socket;
		this.headers = {};
		this.body = '';
		this.statusCode = 0; 
		this.code = {'200':'OK', '301':'Moved Permanently', '302':'Found', '303':'Set Other', '400':'Bad Request', '404':'Not Found', '500':'Internal Server Error'};
	}
	setHeader(name, value){
		this.headers[name] = value;
	}	

	write(data){
		this.sock.write(data);
	}

	end(s){
		if(s){
			this.write(s + '');
		}
		this.sock.end();	
	}

	send(statusCode, body){
		this.statusCode = statusCode;
		this.body = body;
		let counter = 0;
		let len = 0;
		let s = '';
		for (const i in this.headers){
			if(this.headers.hasOwnProperty(i)){
				len++;
			}
		}
		for (const key in this.headers){
			if (this.headers.hasOwnProperty(key)){
				s += key + ": " + this.headers[key];
				counter++;
			}
			if (counter !== len){
				s += '\r\n';
			}
		}
		this.end(`HTTP/1.1 ${this.statusCode} ${this.code[statusCode]}
${s}

${this.body}
`);
	}

	writeHead(statusCode){
		this.statusCode = statusCode;
		let counter = 0;
		let len = 0;
		let s = '';
		for (const i in this.headers){
			if(this.headers.hasOwnProperty(i)){
				len++;
			}
		}
		for (const key in this.headers){
			if (this.headers.hasOwnProperty(key)){
				s += key + ": " + this.headers[key];
				counter++;
			}
			if (counter !== len){
				s += '\r\n';
			}
		}
		this.write(`HTTP/1.1 ${this.statusCode} ${this.code[statusCode]}
${s}

`);	
	}

	redirect(statusCode, url){
//		this.statusCode = statusCode;
		if(arguments.length === 1){
			this.statusCode = 301;
		} else {
			this.statusCode = statusCode;
		}
		this.setHeader('Location', url);					
		console.log(this.headers);
		this.send(statusCode, this.body);		
	}
	
	toString(){
		let s = 'HTTP/1.1 ' + this.statusCode + ' ' +  this.code[this.statusCode] + '\r\n';
		for (const key in this.headers){
			if (this.headers.hasOwnProperty(key)){
				s += key + ": " + this.headers[key] + '\r\n';
			}
		}
		s += '\r\n' + this.body;		
		return s;
	}
}

const server = net.createServer((sock) => {
	console.log(sock.remoteAddress, sock.remotePort);
	sock.on('data', (binaryData) => {
		const req = new Request(binaryData + '');
		if (req.path === '/'){
			sock.write('HTTP/1.1 200 OK\r\nContent-Type:text/html\r\n\r\n<link rel="stylesheet" href="foo.css"> <h2>this is a read header!</h2> <em>Hello </em><strong>World</strong>');
		} else if (req.path === '/foo.css'){
			sock.write('HTTP/1.1 200 OK\r\nContent-Type:text/css\r\n\r\n h2{color:red;}');
		} else {
			sock.write('HTTP/1.1 404 OK\r\nContent-Type:text/plain\r\n\r\n uh oh... 404 page not found');
		}
		sock.end();		
	});
//	sock.end();
});

server.listen(PORT, HOST);

module.exports = {
	Request: Request,
	Response: Response
};
