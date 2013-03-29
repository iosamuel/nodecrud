var http = require('http')
	querystring = require('querystring');

var options = {
	host: "localhost",
	port: 5984,
	path: '/crud',
	method: 'GET',
	headers: {
		'Content-Type': 'application/json'
	}
};

var Productos = exports.Productos = function(){};

Productos.prototype.get = function(pid, cb) {
	options.path = '/crud/'+pid;
	options.method = 'GET';

	var results = '';
	var req = http.request(options, function(res){
		res.setEncoding('utf-8');
		res
			.on('data', function(data){
				results += data;
			})
			.on('end', function(){
				cb(JSON.parse(results));
			});
	});
	req.end();
};

Productos.prototype.findAll = function(opts, cb) {
	options.path = '/crud/_design/productos/_view/all?'+querystring.stringify(opts);
	options.method = 'GET';

	var results = '';
	var req = http.request(options, function(res){
		res.setEncoding('utf-8');
		res
			.on('data', function(data){
				results += data;
			})
			.on('end', function(){
				cb(JSON.parse(results));
			});
	});
	req.end();
};

Productos.prototype.post = function(data, cb) {
	options.path = '/crud';
	options.method = 'POST';
	data.type = 'producto';
	data = JSON.stringify(data);

	var result = '';
	var req = http.request(options, function(res){
		res.setEncoding('utf-8');
		res
			.on('data', function(data){
				result += data;
			})
			.on('end', function(){
				result = JSON.parse(result);
				if (result.ok){
					cb(result.ok);
				} else {
					cb();
				}
			});
	});
	req.write(data);
	req.end();
};

Productos.prototype.delete = function(pid, cb) {
	this.get(pid, function(result){
		var fullPid = result._id + '?rev=' + result._rev;

		options.path = '/crud/'+fullPid;
		options.method = 'DELETE';

		var result = '';
		var req = http.request(options, function(res){
			res.setEncoding('utf-8');

			res
				.on('data', function(data){
					result += data;
				})
				.on('end', function(){
					result = JSON.parse(result);
					if (result.ok){
						cb(result.ok);
					} else {
						cb();
					}
				});
		});
		req.end();
	});
};

Productos.prototype.put = function(pid, data, cb) {
	data.type = 'producto';
	data = JSON.stringify(data);

	this.get(pid, function(result){
		var fullPid = result._id + '?rev=' + result._rev;

		options.path = '/crud/'+fullPid;
		options.method = 'PUT';

		var result = '';
		var req = http.request(options, function(res){
			res.setEncoding('utf-8');

			res
				.on('data', function(data){
					result += data;
				})
				.on('end', function(){
					result = JSON.parse(result);
					if (result.ok){
						cb(result.ok);
					} else {
						cb();
					}
				});
		});
		req.write(data);
		req.end();
	});
};