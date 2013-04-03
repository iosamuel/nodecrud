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

DB.prototype.view = function(desview, opts, cb) {
	options.path = '/'+this.db+'/_design/'+desview.design+'/_view/'+desview.view+'?'+querystring.stringify(opts);
	options.method = 'GET';

	_makeReq(false, null, cb);
};

DB.prototype.newDoc = function(type) {
	return new Doc(this.db, type);
};

Doc.prototype.get = function(pid, cb) {
	options.path = '/'+this.db+'/'+pid;
	options.method = 'GET';

	_makeReq(false, null, cb);
};

Doc.prototype.post = function(data, cb) {
	options.path = '/'+this.db+'/';
	options.method = 'POST';
	data.type = this.type;
	data = JSON.stringify(data);

	_makeReq(true, data, cb);
};

Doc.prototype.delete = function(pid, cb) {
	this.get(pid, function(result){
		var fullPid = result._id + '?rev=' + result._rev;

		options.path = '/'+this.db+'/'+fullPid;
		options.method = 'DELETE';

		_makeReq(false, null, cb);
	}.bind(this));
};

Doc.prototype.put = function(pid, data, cb) {
	data.type = this.type;
	data = JSON.stringify(data);

	this.get(pid, function(result){
		var fullPid = result._id + '?rev=' + result._rev;

		options.path = '/'+this.db+'/'+fullPid;
		options.method = 'PUT';

		_makeReq(true, data, cb);
	}.bind(this));
};

var _makeReq = function(safe, data, cb) {
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
	if (safe) req.write(data);
	req.end();
};

module.exports = DB;