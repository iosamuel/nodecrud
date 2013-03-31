var models = require('./models');

var productos = models.Productos;

exports.index = function(req, res) {
	productos.view({ design:'productos', view:'all' }, { descending:true }, function(results){
		res.render('index', {productos:results.rows});
	});
};

exports.agregar = function(req, res) {
	res.render('agregar');
};

exports.add = function(req, res) {
	var post = req.body;
	delete post._csrf;

	if (post && post.nombre && post.precio && post.user){
		post.precio = parseInt(post.precio);
		productos.post(post, function(result){
			if (result.ok){
				res.redirect('/');
			} else {
				res.send(500, 'Algo ha ido mal!');
			}
		});
	} else {
		res.redirect('/agregar');
	}
};

exports.delete = function(req, res) {
	if (req.params.id){
		productos.delete(req.params.id, function(result){
			if (result.ok){
				res.redirect('/');
			} else {
				res.send(500, 'Algo ha ido mal!');
			}
		});
	} else {
		res.send(500, 'Debe especificar un ID');
	}
};

exports.editar = function(req, res) {
	if (req.params.id){
		productos.get(req.params.id, function(result){
			if (result._id){
				res.render('editar', {producto:result});
			} else {
				res.send(404, 'El producto no existe');
			}
		});
	} else {
		res.send(500, 'Debe especificar un ID');
	}
};

exports.edit = function(req, res) {
	if (req.params.id && req.body){
		var post = req.body;
		delete req.body._csrf;

		productos.put(req.params.id, post, function(result){
			if (result.ok){
				res.redirect('/');
			} else {
				res.send(500, 'Algo ha ido mal!');
			}
		});
	} else {
		res.send(500, 'Error!');
	}
};