/* Variable */
var express = require('express'),
	app = express(),
	routes = require('./routes');

app.listen(8080);

/* Configuracion */
app.configure(function(){
	app.set('view engine', 'ejs');
	app.set('views', __dirname+'/views');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use('/static', express.static(__dirname+'/public'));
});

/* Rutas */
app.get('/', routes.index);

app.get('/agregar', routes.agregar);
app.post('/agregar', routes.add);

app.post('/delete/:id', routes.delete);

app.get('/editar/:id', routes.editar);
app.post('/editar/:id', routes.edit);