var http = require('http')
	querystring = require('querystring');

var options = {
	host: "localhost",
	port: 5984,
	headers: {
		'Content-Type': 'application/json'
	}
};

var Model = function(db, type){
	this.db = db;
	this.type = type;
};

Model.prototype.findAll = function(desview, opts, cb) {
	options.path = '/'+this.db+'/_design/'+desview.design+'/_view/'+desview.view+'?'+querystring.stringify(opts);
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

Model.prototype.get = function(pid, cb) {
	options.path = '/'+this.db+'/'+pid;
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

Model.prototype.post = function(data, cb) {
	options.path = '/'+this.db+'/';
	options.method = 'POST';
	data.type = this.type;
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

Model.prototype.delete = function(pid, cb) {
	this.get(pid, function(result){
		var fullPid = result._id + '?rev=' + result._rev;

		options.path = '/'+this.db+'/'+fullPid;
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

Model.prototype.put = function(pid, data, cb) {
	data.type = this.type;
	data = JSON.stringify(data);

	this.get(pid, function(result){
		var fullPid = result._id + '?rev=' + result._rev;

		options.path = '/'+this.db+'/'+fullPid;
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
	}.bind(this));
};

exports.Productos = new Model('crud', 'producto');