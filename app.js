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
	app.use(function(req, res, next){
		if ('GET' == req.method) res.locals.csrf_token = req.session._csrf;
		if ('POST' == req.method) delete req.body._csrf;
		next();
	});
	app.use('/static', express.static(__dirname+'/public'));
});

/* Rutas */
app.get('/', routes.index);

app.get('/agregar', routes.agregar);
app.post('/agregar', routes.add);

app.post('/delete/:id', routes.delete);

app.get('/editar/:id', routes.editar);
app.post('/editar/:id', routes.edit);