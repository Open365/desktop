if (!Function.prototype.bind) {
  Function.prototype.bind = (function(slice) {
	function bind (context) {
	  var that = this;
	  if (arguments.length>1) {
		var params = slice.call(arguments, 1);

		return function () {
		  return that.apply(context, arguments.length ? params.concat(slice.call(arguments)) : params);
		};
	  }

	  return function () {
		return arguments.length ? that.apply(context, slice.call(arguments)) : that.call(context);
	  };
	}

	return bind;
  })(Array.prototype.slice);
}

if(!window.console){
	window.console={};
}
if(!window.console.log)window.console.log=function(){};
if(!window.console.info)window.console.info=function(){};
if(!window.console.error)window.console.error=function(){};
if(!window.console.warn)window.console.warn=function(){};
if(!window.console.group)window.console.group=function(){};
if(!window.console.groupEnd)window.console.groupEnd=function(){};

if (!Object.keys) {
	Object.keys = (function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function (obj) {
			if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

			var result = [];

			for (var prop in obj) {
				if (hasOwnProperty.call(obj, prop)) result.push(prop);
			}

			if (hasDontEnumBug) {
				for (var i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
				}
			}
			return result;
		}
	})()
}

if (!Array.isArray) {
	Array.isArray = function (vArg) {
		return Object.prototype.toString.call(vArg) === "[object Array]";
	};
}

window._cb = function (func) {
	return func;
};

var __nativeST__ = window.setTimeout, __nativeSI__ = window.setInterval;

window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
	var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
	return __nativeST__(vCallback instanceof Function ? _cb(function () {
		vCallback.apply(oThis, aArgs);
	}) : vCallback, nDelay);
};

window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
	var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
	return __nativeSI__(vCallback instanceof Function ? _cb(function () {
		vCallback.apply(oThis, aArgs);
	}) : vCallback, nDelay);
};

if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/g, '');
	};
}
