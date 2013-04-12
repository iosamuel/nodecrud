var DB = require('./models');
var crypto = require('crypto');

var db = new DB('crud');
var productos = db.newDoc('producto');
var users = db.newDoc('user');

var sha1 = function(str){
	return crypto.createHash('sha1').update(str).digest('hex');
};

Array.prototype.unique = function(p) {
	var i = {};
	for (var n=0; n<this.length; n++){
		var c = this[n][p];
		if (i.hasOwnProperty(c)) { this.splice(n,1); n--; continue; }
		i[c] = true;
	}
};

exports.index = function(req, res) {
	if (!req.query.q){
		var options = {
			descending: true
		};
		db.view({ design:'productos', view:'byDate', options:options }, function(results){
			res.render('index', {productos:results.rows});
		});
	} else {
		var options = {
			descending: true,
			startkey: '["'+req.query.q+'\u9999",{}]',
			endkey: '["'+req.query.q+'"]'
		};
		db.view({ design:'productos', view:'searchByNombre', options:options }, function(results){
			results.rows.unique('id');
			res.render('index', {productos:results.rows});
		});
	}
};

exports.mios = function(req, res){
	if (!req.query.q){
		var options = {
			descending:true,
			startkey:'["'+req.session.user+'",{}]',
			endkey:'["'+req.session.user+'"]'
		};
		db.view({ design:'productos', view:'byUser', options:options }, function(results){
			res.render('index', {productos:results.rows});
		});
	} else {
		var options = {
			descending: true,
			startkey: '["'+req.session.user+'","'+req.query.q+'\u9999",{}]',
			endkey: '["'+req.session.user+'","'+req.query.q+'"]'
		};
		db.view({ design:'productos', view:'searchByNombreUser', options:options }, function(results){
			results.rows.unique('id');
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