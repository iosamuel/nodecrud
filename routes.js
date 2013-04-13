var CouchDB = require('./models');
var crypto = require('crypto');

var db = new CouchDB('crud', {
	user: 'user',
	passwd: 'passwd'
});
var productos = db.newDoc('producto');
var users = db.newDoc('user');

var sha1 = function(str){
	return crypto.createHash('sha1').update(str).digest('hex');
};

exports.index = function(req, res) {
	if (!req.query.q){
		var options = {
			descending: true
		};
		db.design('productos', { type:'view', name:'byDate', params:options }, function(results){
			res.render('index', {productos:results.rows});
		});
	} else {
		var options = {
			descending: true,
			startkey: '["?\u9999",{}]'.format(req.query.q),
			endkey: '["?"]'.format(req.query.q)
		};
		db.design('productos', { type:'view', name:'searchByNombre', params:options }, function(results){
			results.rows.unique();
			res.render('index', {productos:results.rows});
		});
	}
};

exports.mios = function(req, res){
	if (!req.query.q){
		var options = {
			descending:true,
			startkey:'["?",{}]'.format(req.session.user),
			endkey:'["?"]'.format(req.session.user)
		};
		db.design('productos', { type:'view', name:'byUser', params:options }, function(results){
			res.render('index', {productos:results.rows});
		});
	} else {
		var options = {
			descending: true,
			startkey: '["?","?\u9999",{}]'.format(req.session.user, req.query.q),
			endkey: '["?","?"]'.format(req.session.user, req.query.q)
		};
		db.design('productos', { type:'view', name:'searchByNombreUser', params:options }, function(results){
			results.rows.unique();
			res.render('index', {productos:results.rows});
		});
	}
};

exports.agregar = function(req, res) {
	res.render('agregar');
};

exports.add = function(req, res) {
	var post = req.body;
	if (post && post.nombre && post.precio){
		post.precio = parseInt(post.precio);
		post.user = req.session.user;
		post.created = Date.parse(new Date());

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
		post.user = req.session.user;

		productos.get(req.params.id, function(result){
			post.created = result.created;
			productos.put(req.params.id, post, function(result){
				if (result.ok){
					res.redirect('/');
				} else {
					res.send(500, 'Algo ha ido mal!');
				}
			});
		});
	} else {
		res.send(500, 'Error!');
	}
};

exports.login = function(req, res){
	if (req.body && req.body.user && req.body.passwd){
		users.get(req.body.user, function(result){
			if (result._id){
				if (sha1(req.body.passwd) == result.passwd){
					req.session.user = result._id;
					res.redirect('/');
				} else {
					res.send(404, 'El usuario y la contraseña no coinciden!');
				}
			} else {
				res.send(404, 'El usuario no existe!');
			}
		});
	} else {
		res.send(500, 'Error!');
	}
};

exports.signup = function(req, res){
	if (req.body && req.body.user && req.body.passwd){
		users.get(req.body.user, function(result){
			if (result._id){
				res.send(500, 'El usuario ya existe');
			} else {
				var post = req.body;
				post._id = post.user;
				delete post.user;
				post.passwd = sha1(post.passwd);

				users.post(post, function(result){
					if (result.ok){
						res.redirect('/');
					} else {
						res.send(500, 'Algo ha ido mal!');
					}
				});
			}
		});
	} else {
		res.send(500, 'Error!');
	}
};