/* Variable */
var express = require('express'),
	app = express(),
	routes = require('./routes');

app.listen(8080);

/* Configuracion */
app.configure(function(){
	app.set('view engine', 'ejs');
	app.set('views', __dirname+'/views');
	app.use(express.cookieParser());
	app.use(express.session({ secret:'MySecretString' }));
	app.use(express.bodyParser());
	app.use(express.csrf());
	app.use('/static', express.static(__dirname+'/public'));
});

var csrf = function(req, res, next){
	res.locals.csrf_token = req.session._csrf;
	next();
};

/* Rutas */
app.get('/', csrf, routes.index);

app.get('/agregar', csrf, routes.agregar);
app.post('/agregar', routes.add);

app.post('/delete/:id', routes.delete);

app.get('/editar/:id', csrf, routes.editar);
app.post('/editar/:id', routes.edit);