// miniWeb.js
// define your Request, Response and App objects here

const net = require('net');
const [HOST, PORT] = ['127.0.0.1', 8080];
const fs = require('fs');

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
		for (const key in this.headers){
			if (this.headers.hasOwnProperty(key)){
				s += key + ": " + this.headers[key] + '\r\n';
			}
		}
		s += '\r\n' + this.body;
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
		this.type = {'jpeg':'image/jpeg', 'jpg':'image/jpeg', 'png':'image/png','gif':'image/gif', 'html':'text/html', 'css':'text/css', 'txt':'text/plain'};	
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
		let s = '';
		for (const key in this.headers){
			if (this.headers.hasOwnProperty(key)){
				s += key + ": " + this.headers[key] + '\r\n';
			}
		}
		this.end(`HTTP/1.1 ${this.statusCode} ${this.code[statusCode]}
${s}

${this.body}
`);
	}

	writeHead(statusCode){
		this.statusCode = statusCode;
		let s = '';
		for (const key in this.headers){
			if (this.headers.hasOwnProperty(key)){
				s += key + ": " + this.headers[key] + '\r\n';
			}
		}	
		this.write(`HTTP/1.1 ${this.statusCode} ${this.code[statusCode]}
${s}
`);	
	}		

	redirect(statusCode, url){
		if(url === undefined){
			this.statusCode = 301;
			this.setHeader('Location', statusCode);
		} else {
			this.statusCode = statusCode;
			this.setHeader('Location', url);					
		}
			this.send(this.statusCode, this.body);		
	}
	
	toString(){
		let s = 'HTTP/1.1 ' + this.statusCode + ' ' + this.code[this.statusCode] + '\r\n';
		for (const key in this.headers){
			if (this.headers.hasOwnProperty(key)){
				s += key + ": " + this.headers[key] + '\r\n';
			}
		}
		s += '\r\n' + this.body;		
		return s;
	}

	handleRead(contentType, err, data){
		if(err){
			this.writeHead(500);
		}
		this.setHeader('Content-Type', contentType);
		this.writeHead(200);
		this.write(data);
		this.end();
	}

	sendFile(fileName){
		const ext = fileName.split('.').pop();
		const publicRoot = __dirname + '/../public/';
		if (ext === 'jpeg' || ext === 'jpg' || ext === 'png' || ext === 'gif'){
			const filePath = publicRoot + 'img/' + fileName;
			fs.readFile(filePath, {}, this.handleRead.bind(this, this.type[ext]));
		} else if(this.type[ext] === undefined){
			this.writeHead(500);
		} else {
			const filePath = publicRoot + '/html/' + fileName;
			fs.readFile(filePath, {'encoding':'utf8'}, this.handleRead.bind(this, this.type[ext]));
		}
	}
}
				
class App{
	
	constructor(){
//		this.handleConnection = handleConnection();
		this.routes = {};
		this.server = net.createServer(this.handleConnection.bind(this));
	}
	
	get(path, cb){
		this.routes[path] = cb;	
	}	

	listen(port, host){
		this.server.listen(port, host);		
	}

	handleConnection(sock){
		sock.on('data', this.handleRequestData.bind(this, sock));
	}
	
	handleRequestData(sock, binaryDate){
		const data = binaryData + '';
		const req = new Request(data);
		const res = new Response(sock);
	//	logResponse(req, res);
		if(!req.headers.hasOwnProperty('Host')){
			res.writeHead(400);	
		}
		if(req.path === undefined){
			res.writeHead(404);
		} else{	
			const path = this.routes[req.path].slice(0, -1);
		}
		sock.on('close', this.logResponse.bind(this, req, res));
//Still Working on it	
	}	
	
	logResponse(req, res){
		console.log(req.toString(), '\r\n', res.toString());
	}
	
}

const server = net.createServer((sock) => {
	console.log(sock.remoteAddress, sock.remotePort);
	sock.on('data', (binaryData) => {
		const req = new Request(binaryData + '');
		const res = new Response(sock);
		if(req.path === '/'){
			res.setHeader('Content-Type', 'text/html');
			res.body = '<link rel="stylesheet" href="foo.css"> <h2>this is a read header!</h2> <em>Hello </em><strong>World</strong>';
			res.send(200, res.body);
		} else if(req.path === '/foo.css'){
			res.setHeader('Content-Type', 'text/css');
			res.body = 'h2{color:red;}';
			res.send(200, res.body);
		} else if(req.path === '/test'){
			res.sendFile('test.html');
		} else if(req.path === '/img/bmo1.gif'){
			res.sendFile('bmo1.gif');
		} else {
			res.setHeader('Content-Type', 'text/plain');
			res.body = 'uh oh... 404 page not found';
			res.send(404, res.body);
		}
	});
});

server.listen(PORT, HOST);

module.exports = {
	Request: Request,
	Response: Response,
	App: App
};

