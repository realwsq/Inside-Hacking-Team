function wrapper(kov, koa) {
	var keysOfValue = kov;
	var keysOfAttrib = koa;
	var wwrapper = {};
	wwrapper.jsonify = function(obj) {
		var _ = {};
		keysOfValue.forEach(function(k) { _[k] = obj[k]; })
		keysOfAttrib.forEach(function(a) { _[a] = obj[a]; })
		return JSON.stringify(_);
	}
	wwrapper.getValue = function(string) {
		var obj = JSON.parse(string)
		return keysOfValue.map(function(k) {return obj[k];});
	}

	return wwrapper;
}