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
		if (req.method == 'GET') res.locals.csrf_token = '<input type="hidden" name="_csrf" value="'+req.session._csrf+'">';
		if (req.method == 'POST') delete req.body._csrf;
		next();
	});
	app.use(function(req, res, next){
		res.locals.user = req.session.user;
		next();
	});
	app.use('/static', express.static(__dirname+'/public'));
});

var login_required = function(req, res, next){
	if (!req.session.user) return res.send(403, 'Acceso prohibido!');
	next();
};

/* Rutas */
app.get('/', routes.index);

app.get('/agregar', login_required, routes.agregar);
app.post('/agregar', login_required, routes.add);

app.post('/delete/:id', login_required, routes.delete);

app.get('/editar/:id', login_required, routes.editar);
app.post('/editar/:id', login_required, routes.edit);

app.post('/login', routes.login);
app.get('/logout', function(req, res){ delete req.session.user; res.redirect('/'); });

app.post('/signup', routes.signup);