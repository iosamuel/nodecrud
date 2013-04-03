var http = require('http')
	querystring = require('querystring');

var options = {
	host: "localhost",
	port: 5984,
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Basic ' + new Buffer('user:passwd').toString('base64')
	}
};

var DB = function(db){
	this.db = db;
};

var Doc = function(db, type){
	this.db = db;
	this.type = type;
};

DB.prototype.view = function(opts, cb) {
	options.path = '/'+this.db+'/_design/'+opts.design+'/_view/'+opts.view+'?'+querystring.stringify(opts.options);
	options.method = 'GET';

	_makeReq(cb);
};

DB.prototype.newDoc = function(type) {
	return new Doc(this.db, type);
};

Doc.prototype.get = function(pid, cb) {
	options.path = '/'+this.db+'/'+pid;
	options.method = 'GET';

	_makeReq(cb);
};

Doc.prototype.post = function(data, cb) {
	options.path = '/'+this.db+'/';
	options.method = 'POST';
	data.type = this.type;
	data = JSON.stringify(data);

	_makeReq(data, cb);
};

Doc.prototype.delete = function(pid, cb) {
	this.get(pid, function(result){
		var fullPid = result._id + '?rev=' + result._rev;

		options.path = '/'+this.db+'/'+fullPid;
		options.method = 'DELETE';

		_makeReq(cb);
	}.bind(this));
};

Doc.prototype.put = function(pid, data, cb) {
	data.type = this.type;
	data = JSON.stringify(data);

	this.get(pid, function(result){
		var fullPid = result._id + '?rev=' + result._rev;

		options.path = '/'+this.db+'/'+fullPid;
		options.method = 'PUT';

		_makeReq(data, cb);
	}.bind(this));
};

var _makeReq = function(data, cb) {
	if (typeof data === 'function'){
		cb = data;
		data = null;
	}
	var results = '';
	var req = http.request(options, function(res){
		res
			.on('data', function(recv){
				results += recv;
			})
			.on('end', function(){
				cb(JSON.parse(results));
			});
	});
	if (data) req.write(data);
	req.end();
};

module.exports = DB;