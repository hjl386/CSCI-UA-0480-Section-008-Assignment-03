// fansite.js
// create your own fansite using your miniWeb framework

const App = require('./miniWeb.js').App;
const app = new App();

const [HOST, PORT] = ['127.0.0.1', 8080];

app.get('/', function(req, res){
	res.sendFile('index.html');			
});

app.get('/about', function(req, res){
	res.sendFile('about.html');			
});

app.get('/css/base.css', function(req, res){
	res.sendFile('../css/base.css');			
});

app.get('/rando', function(req, res){
	res.setHeader('Content-Type', 'text/html');
	res.writeHead(200);
	res.write(`
<!DOCTYPE html>
<html>
	<head>
		<meta charset='utf-8'>
		<title>HOME</title>
		<link rel='stylesheet' type='text/css' href='/css/base.css'>
	</head>
	<body>
		<center><h1>PIKA PIKA PIKA</h1></center>
		<nav role='links'>
			<a href='/'>Home</a>
			<a href='/about'></a>
			<a href='/rando'>Rando</a>
		</nav> `);
	const arrImage = ['extra', 'image1', 'image2', 'image3'];
	const ran = arrImage[Math.floor(Math.random() * arrImage.length)];
	res.write('<img src=\'/' + ran + '\' width=\'500\'></img>');
	res.write('</body> <html>');
	res.end();	
});


app.get('/extra', function(req, res){
	res.sendFile('pH.jpg');	
});

app.get('/image1', function(req, res){
	res.sendFile('pikachu.jpg');			
});

app.get('/image2', function(req, res){
	res.sendFile('pika.png');			
});

app.get('/image3', function(req, res){
	res.sendFile('pi.gif');			
});

app.get('/home', function(req, res){
	res.redirect(301, '/');			
});

app.listen(PORT, HOST);


