// -- (function(scope){
// -- 'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.ds.bz === region.dR.bz)
	{
		return 'on line ' + region.ds.bz;
	}
	return 'on lines ' + region.ds.bz + ' through ' + region.dR.bz;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.fm,
		impl.fY,
		impl.fO,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


/*
function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}

*/

/*
function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}

*/

/*
function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}

*/

/*
function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}

*/



// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS


function _VirtualDom_noScript(tag)
{
	return tag == 'script' ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return /^(on|formAction$)/i.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,'')) ? '' : value;
}

function _VirtualDom_noJavaScriptUri_UNUSED(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,''))
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value) ? '' : value;
}

function _VirtualDom_noJavaScriptOrHtmlUri_UNUSED(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value)
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		aC: func(record.aC),
		dt: record.dt,
		dd: record.dd
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.aC;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.dt;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.dd) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.fm,
		impl.fY,
		impl.fO,
		function(sendToApp, initialModel) {
			var view = impl.fZ;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.fm,
		impl.fY,
		impl.fO,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.dk && impl.dk(sendToApp)
			var view = impl.fZ;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.eZ);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.cd) && (_VirtualDom_doc.title = title = doc.cd);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.fv;
	var onUrlRequest = impl.fw;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		dk: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.eu === next.eu
							&& curr.dZ === next.dZ
							&& curr.eq.a === next.eq.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		fm: function(flags)
		{
			return A3(impl.fm, flags, _Browser_getUrl(), key);
		},
		fZ: impl.fZ,
		fY: impl.fY,
		fO: impl.fO
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { fj: 'hidden', e1: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { fj: 'mozHidden', e1: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { fj: 'msHidden', e1: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { fj: 'webkitHidden', e1: 'webkitvisibilitychange' }
		: { fj: 'hidden', e1: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		eC: _Browser_getScene(),
		eQ: {
			Y: _Browser_window.pageXOffset,
			Z: _Browser_window.pageYOffset,
			eT: _Browser_doc.documentElement.clientWidth,
			dY: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		eT: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		dY: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			eC: {
				eT: node.scrollWidth,
				dY: node.scrollHeight
			},
			eQ: {
				Y: node.scrollLeft,
				Z: node.scrollTop,
				eT: node.clientWidth,
				dY: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			eC: _Browser_getScene(),
			eQ: {
				Y: x,
				Z: y,
				eT: _Browser_doc.documentElement.clientWidth,
				dY: _Browser_doc.documentElement.clientHeight
			},
			fb: {
				Y: x + rect.left,
				Z: y + rect.top,
				eT: rect.width,
				dY: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});
var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.u) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.x),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.x);
		} else {
			var treeLen = builder.u * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.B) : builder.B;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.u);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.x) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.x);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{B: nodeList, u: (len / $elm$core$Array$branchFactor) | 0, x: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {dX: fragment, dZ: host, eo: path, eq: port_, eu: protocol, ev: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$document = _Browser_document;
var $author$project$GossipProtocol$GossipProtocol$Root = {$: 0};
var $author$project$GossipProtocol$Conditions$Predefined$any = F3(
	function (_v0, _v1, _v2) {
		return true;
	});
var $elm_community$graph$Graph$Graph = $elm$core$Basics$identity;
var $elm_community$intdict$IntDict$Empty = {$: 0};
var $elm_community$intdict$IntDict$empty = $elm_community$intdict$IntDict$Empty;
var $elm_community$graph$Graph$empty = $elm_community$intdict$IntDict$empty;
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $zwilias$elm_rosetree$Tree$Tree = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $zwilias$elm_rosetree$Tree$singleton = function (v) {
	return A2($zwilias$elm_rosetree$Tree$Tree, v, _List_Nil);
};
var $author$project$Main$init = function (_v0) {
	return _Utils_Tuple2(
		{
			aL: $elm$core$Result$Ok(_List_Nil),
			ao: $elm$core$Result$Ok(_List_Nil),
			bW: '',
			bu: 5,
			t: $elm$core$Result$Ok($elm_community$graph$Graph$empty),
			cz: {bm: 6, co: 400, cp: 800, b$: 1.5, aQ: 20},
			w: $zwilias$elm_rosetree$Tree$singleton($author$project$GossipProtocol$GossipProtocol$Root),
			J: $elm_community$graph$Graph$empty,
			ah: 0,
			ai: '',
			aa: '',
			U: {cr: _List_Nil, cd: '', bk: false},
			aT: $author$project$GossipProtocol$Conditions$Predefined$any,
			as: 'any',
			bD: $elm$core$Result$Ok(_List_Nil)
		},
		$elm$core$Platform$Cmd$none);
};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $elm$core$Platform$Sub$none = $elm$core$Platform$Sub$batch(_List_Nil);
var $author$project$Main$subscriptions = function (_v0) {
	return $elm$core$Platform$Sub$none;
};
var $author$project$Main$ChangeGossipGraph = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Result$andThen = F2(
	function (callback, result) {
		if (!result.$) {
			var value = result.a;
			return callback(value);
		} else {
			var msg = result.a;
			return $elm$core$Result$Err(msg);
		}
	});
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Utils$List$get = F2(
	function (list, index) {
		return $elm$core$List$head(
			A2($elm$core$List$drop, index, list));
	});
var $author$project$GossipGraph$Call$fromList = function (agents) {
	var to = A2($author$project$Utils$List$get, agents, 1);
	var from = A2($author$project$Utils$List$get, agents, 0);
	if ($elm$core$List$length(agents) > 2) {
		return $elm$core$Result$Err('A call must contain two agents.');
	} else {
		var _v0 = _Utils_Tuple2(from, to);
		if ((!_v0.a.$) && (!_v0.b.$)) {
			var f = _v0.a.a;
			var t = _v0.b.a;
			return _Utils_eq(f.b1, t.b1) ? $elm$core$Result$Err('An agent cannot call itself.') : $elm$core$Result$Ok(
				{ap: f.b1, aV: t.b1});
		} else {
			return $elm$core$Result$Err('A call must contain two agents.');
		}
	}
};
var $author$project$Utils$List$find = F2(
	function (f, xs) {
		var findAcc = function (list) {
			findAcc:
			while (true) {
				if (!list.b) {
					return $elm$core$Maybe$Nothing;
				} else {
					var y = list.a;
					var ys = list.b;
					if (f(y)) {
						return $elm$core$Maybe$Just(y);
					} else {
						var $temp$list = ys;
						list = $temp$list;
						continue findAcc;
					}
				}
			}
		};
		return findAcc(xs);
	});
var $elm$core$String$cons = _String_cons;
var $elm$core$String$fromChar = function (_char) {
	return A2($elm$core$String$cons, _char, '');
};
var $elm$core$Result$fromMaybe = F2(
	function (err, maybe) {
		if (!maybe.$) {
			var v = maybe.a;
			return $elm$core$Result$Ok(v);
		} else {
			return $elm$core$Result$Err(err);
		}
	});
var $elm$core$Char$toUpper = _Char_toUpper;
var $author$project$GossipGraph$Agent$fromChar = F2(
	function (agents, _char) {
		return A2(
			$elm$core$Result$fromMaybe,
			'Agent “' + ($elm$core$String$fromChar(
				$elm$core$Char$toUpper(_char)) + '” does not exist.'),
			A2(
				$author$project$Utils$List$find,
				function (agent) {
					return _Utils_eq(
						agent.cY,
						$elm$core$Char$toUpper(_char));
				},
				agents));
	});
var $elm$core$String$fromList = _String_fromList;
var $elm$core$String$foldr = _String_foldr;
var $elm$core$String$toList = function (string) {
	return A3($elm$core$String$foldr, $elm$core$List$cons, _List_Nil, string);
};
var $author$project$GossipGraph$Agent$fromString = F2(
	function (agents, string) {
		var list = $elm$core$String$toList(string);
		if (!list.b) {
			return $elm$core$Result$Ok(_List_Nil);
		} else {
			var x = list.a;
			var xs = list.b;
			var _v1 = A2($author$project$GossipGraph$Agent$fromChar, agents, x);
			if (!_v1.$) {
				var agent = _v1.a;
				var _v2 = A2(
					$author$project$GossipGraph$Agent$fromString,
					agents,
					$elm$core$String$fromList(xs));
				if (!_v2.$) {
					var ys = _v2.a;
					return $elm$core$Result$Ok(
						A2($elm$core$List$cons, agent, ys));
				} else {
					var e = _v2.a;
					return $elm$core$Result$Err(e);
				}
			} else {
				var e = _v1.a;
				return $elm$core$Result$Err(e);
			}
		}
	});
var $author$project$CallSequence$Parser$CallToken = function (a) {
	return {$: 0, a: a};
};
var $author$project$CallSequence$Parser$Separator = {$: 1};
var $author$project$Utils$List$dropWhile = F2(
	function (f, xs) {
		var trav = F2(
			function (fun, list) {
				trav:
				while (true) {
					if (!list.b) {
						return _List_Nil;
					} else {
						var y = list.a;
						var ys = list.b;
						if (fun(y)) {
							var $temp$fun = fun,
								$temp$list = ys;
							fun = $temp$fun;
							list = $temp$list;
							continue trav;
						} else {
							return A2($elm$core$List$cons, y, ys);
						}
					}
				}
			});
		return A2(trav, f, xs);
	});
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$core$List$member = F2(
	function (x, xs) {
		return A2(
			$elm$core$List$any,
			function (a) {
				return _Utils_eq(a, x);
			},
			xs);
	});
var $author$project$CallSequence$Parser$separators = _List_fromArray(
	[';', ',', ' ']);
var $elm$core$Basics$not = _Basics_not;
var $author$project$Utils$List$takeWhile = F2(
	function (f, xs) {
		var trav = F3(
			function (fun, list, acc) {
				trav:
				while (true) {
					if (!list.b) {
						return $elm$core$List$reverse(acc);
					} else {
						var y = list.a;
						var ys = list.b;
						if (!fun(y)) {
							return $elm$core$List$reverse(acc);
						} else {
							var $temp$fun = fun,
								$temp$list = ys,
								$temp$acc = A2($elm$core$List$cons, y, acc);
							fun = $temp$fun;
							list = $temp$list;
							acc = $temp$acc;
							continue trav;
						}
					}
				}
			});
		return A3(trav, f, xs, _List_Nil);
	});
var $author$project$CallSequence$Parser$whitespace = _List_fromArray(
	[' ', '\t', '\n']);
var $author$project$CallSequence$Parser$lexer = function (s) {
	var charLexer = F2(
		function (chars, pos) {
			charLexer:
			while (true) {
				if (!chars.b) {
					return $elm$core$Result$Ok(_List_Nil);
				} else {
					var c = chars.a;
					var cs = chars.b;
					if (A2($elm$core$List$member, c, $author$project$CallSequence$Parser$whitespace)) {
						var $temp$chars = cs,
							$temp$pos = pos + 1;
						chars = $temp$chars;
						pos = $temp$pos;
						continue charLexer;
					} else {
						if (A2($elm$core$List$member, c, $author$project$CallSequence$Parser$separators)) {
							var _v1 = A2(charLexer, cs, pos + 1);
							if (!_v1.$) {
								var tokens = _v1.a;
								return $elm$core$Result$Ok(
									A2($elm$core$List$cons, $author$project$CallSequence$Parser$Separator, tokens));
							} else {
								var e = _v1.a;
								return $elm$core$Result$Err(e);
							}
						} else {
							if ($elm$core$Char$isAlpha(c)) {
								var token = $elm$core$String$fromList(
									A2(
										$elm$core$List$cons,
										c,
										A2(
											$author$project$Utils$List$takeWhile,
											function (x) {
												return $elm$core$Char$isAlpha(x);
											},
											cs)));
								var rest = A2(
									charLexer,
									A2(
										$author$project$Utils$List$dropWhile,
										function (x) {
											return $elm$core$Char$isAlpha(x);
										},
										cs),
									pos + $elm$core$String$length(token));
								if (!rest.$) {
									var tokens = rest.a;
									return $elm$core$Result$Ok(
										A2(
											$elm$core$List$cons,
											$author$project$CallSequence$Parser$CallToken(token),
											tokens));
								} else {
									var e = rest.a;
									return $elm$core$Result$Err(e);
								}
							} else {
								return $elm$core$Result$Err(
									'Invalid character ‘' + ($elm$core$String$fromChar(c) + ('’ at position ' + $elm$core$String$fromInt(pos))));
							}
						}
					}
				}
			}
		});
	return A2(
		charLexer,
		$elm$core$String$toList(s),
		1);
};
var $elm$core$Result$map = F2(
	function (func, ra) {
		if (!ra.$) {
			var a = ra.a;
			return $elm$core$Result$Ok(
				func(a));
		} else {
			var e = ra.a;
			return $elm$core$Result$Err(e);
		}
	});
var $author$project$CallSequence$Parser$parse = F2(
	function (input, agents) {
		var parseCall = function (s) {
			return A2(
				$elm$core$Result$andThen,
				$author$project$GossipGraph$Call$fromList,
				A2($author$project$GossipGraph$Agent$fromString, agents, s));
		};
		var tryParse = function (tokens) {
			tryParse:
			while (true) {
				if (!tokens.b) {
					return $elm$core$Result$Ok(_List_Nil);
				} else {
					var t = tokens.a;
					var ts = tokens.b;
					if (t.$ === 1) {
						var $temp$tokens = ts;
						tokens = $temp$tokens;
						continue tryParse;
					} else {
						var s = t.a;
						var _v2 = _Utils_Tuple2(
							parseCall(s),
							tryParse(ts));
						if (!_v2.a.$) {
							if (!_v2.b.$) {
								var call = _v2.a.a;
								var seq = _v2.b.a;
								return $elm$core$Result$Ok(
									A2($elm$core$List$cons, call, seq));
							} else {
								var e = _v2.b.a;
								return $elm$core$Result$Err(e);
							}
						} else {
							var e = _v2.a.a;
							return $elm$core$Result$Err('I ran into an error parsing the call “' + (s + ('”: ' + e)));
						}
					}
				}
			}
		};
		return A2(
			$elm$core$Result$map,
			$elm$core$List$reverse,
			A2(
				$elm$core$Result$andThen,
				tryParse,
				$author$project$CallSequence$Parser$lexer(input)));
	});
var $author$project$Main$changeCallSequence = F2(
	function (model, input) {
		var callSequence = A2(
			$elm$core$Result$andThen,
			$author$project$CallSequence$Parser$parse(input),
			model.aL);
		return _Utils_Tuple2(
			_Utils_update(
				model,
				{ao: callSequence, ai: input}),
			$elm$core$Platform$Cmd$none);
	});
var $elm_community$graph$Graph$NodeContext = F3(
	function (node, incoming, outgoing) {
		return {d1: incoming, ej: node, c2: outgoing};
	});
var $elm$core$Basics$always = F2(
	function (a, _v0) {
		return a;
	});
var $elm_community$intdict$IntDict$Inner = function (a) {
	return {$: 2, a: a};
};
var $elm_community$intdict$IntDict$size = function (dict) {
	switch (dict.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		default:
			var i = dict.a;
			return i.dl;
	}
};
var $elm_community$intdict$IntDict$inner = F3(
	function (p, l, r) {
		var _v0 = _Utils_Tuple2(l, r);
		if (!_v0.a.$) {
			var _v1 = _v0.a;
			return r;
		} else {
			if (!_v0.b.$) {
				var _v2 = _v0.b;
				return l;
			} else {
				return $elm_community$intdict$IntDict$Inner(
					{
						d: l,
						i: p,
						e: r,
						dl: $elm_community$intdict$IntDict$size(l) + $elm_community$intdict$IntDict$size(r)
					});
			}
		}
	});
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $elm$core$Basics$neq = _Utils_notEqual;
var $elm$core$Bitwise$complement = _Bitwise_complement;
var $elm$core$Bitwise$or = _Bitwise_or;
var $elm$core$Bitwise$shiftRightZfBy = _Bitwise_shiftRightZfBy;
var $elm_community$intdict$IntDict$highestBitSet = function (n) {
	var shiftOr = F2(
		function (i, shift) {
			return i | (i >>> shift);
		});
	var n1 = A2(shiftOr, n, 1);
	var n2 = A2(shiftOr, n1, 2);
	var n3 = A2(shiftOr, n2, 4);
	var n4 = A2(shiftOr, n3, 8);
	var n5 = A2(shiftOr, n4, 16);
	return n5 & (~(n5 >>> 1));
};
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm_community$intdict$IntDict$signBit = $elm_community$intdict$IntDict$highestBitSet(-1);
var $elm$core$Bitwise$xor = _Bitwise_xor;
var $elm_community$intdict$IntDict$isBranchingBitSet = function (p) {
	return A2(
		$elm$core$Basics$composeR,
		$elm$core$Bitwise$xor($elm_community$intdict$IntDict$signBit),
		A2(
			$elm$core$Basics$composeR,
			$elm$core$Bitwise$and(p.a$),
			$elm$core$Basics$neq(0)));
};
var $elm_community$intdict$IntDict$higherBitMask = function (branchingBit) {
	return branchingBit ^ (~(branchingBit - 1));
};
var $elm_community$intdict$IntDict$lcp = F2(
	function (x, y) {
		var branchingBit = $elm_community$intdict$IntDict$highestBitSet(x ^ y);
		var mask = $elm_community$intdict$IntDict$higherBitMask(branchingBit);
		var prefixBits = x & mask;
		return {a$: branchingBit, al: prefixBits};
	});
var $elm_community$intdict$IntDict$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm_community$intdict$IntDict$leaf = F2(
	function (k, v) {
		return $elm_community$intdict$IntDict$Leaf(
			{d7: k, eO: v});
	});
var $elm_community$intdict$IntDict$prefixMatches = F2(
	function (p, n) {
		return _Utils_eq(
			n & $elm_community$intdict$IntDict$higherBitMask(p.a$),
			p.al);
	});
var $elm_community$intdict$IntDict$update = F3(
	function (key, alter, dict) {
		var join = F2(
			function (_v2, _v3) {
				var k1 = _v2.a;
				var l = _v2.b;
				var k2 = _v3.a;
				var r = _v3.b;
				var prefix = A2($elm_community$intdict$IntDict$lcp, k1, k2);
				return A2($elm_community$intdict$IntDict$isBranchingBitSet, prefix, k2) ? A3($elm_community$intdict$IntDict$inner, prefix, l, r) : A3($elm_community$intdict$IntDict$inner, prefix, r, l);
			});
		var alteredNode = function (mv) {
			var _v1 = alter(mv);
			if (!_v1.$) {
				var v = _v1.a;
				return A2($elm_community$intdict$IntDict$leaf, key, v);
			} else {
				return $elm_community$intdict$IntDict$empty;
			}
		};
		switch (dict.$) {
			case 0:
				return alteredNode($elm$core$Maybe$Nothing);
			case 1:
				var l = dict.a;
				return _Utils_eq(l.d7, key) ? alteredNode(
					$elm$core$Maybe$Just(l.eO)) : A2(
					join,
					_Utils_Tuple2(
						key,
						alteredNode($elm$core$Maybe$Nothing)),
					_Utils_Tuple2(l.d7, dict));
			default:
				var i = dict.a;
				return A2($elm_community$intdict$IntDict$prefixMatches, i.i, key) ? (A2($elm_community$intdict$IntDict$isBranchingBitSet, i.i, key) ? A3(
					$elm_community$intdict$IntDict$inner,
					i.i,
					i.d,
					A3($elm_community$intdict$IntDict$update, key, alter, i.e)) : A3(
					$elm_community$intdict$IntDict$inner,
					i.i,
					A3($elm_community$intdict$IntDict$update, key, alter, i.d),
					i.e)) : A2(
					join,
					_Utils_Tuple2(
						key,
						alteredNode($elm$core$Maybe$Nothing)),
					_Utils_Tuple2(i.i.al, dict));
		}
	});
var $elm_community$intdict$IntDict$insert = F3(
	function (key, value, dict) {
		return A3(
			$elm_community$intdict$IntDict$update,
			key,
			$elm$core$Basics$always(
				$elm$core$Maybe$Just(value)),
			dict);
	});
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm_community$intdict$IntDict$get = F2(
	function (key, dict) {
		get:
		while (true) {
			switch (dict.$) {
				case 0:
					return $elm$core$Maybe$Nothing;
				case 1:
					var l = dict.a;
					return _Utils_eq(l.d7, key) ? $elm$core$Maybe$Just(l.eO) : $elm$core$Maybe$Nothing;
				default:
					var i = dict.a;
					if (!A2($elm_community$intdict$IntDict$prefixMatches, i.i, key)) {
						return $elm$core$Maybe$Nothing;
					} else {
						if (A2($elm_community$intdict$IntDict$isBranchingBitSet, i.i, key)) {
							var $temp$key = key,
								$temp$dict = i.e;
							key = $temp$key;
							dict = $temp$dict;
							continue get;
						} else {
							var $temp$key = key,
								$temp$dict = i.d;
							key = $temp$key;
							dict = $temp$dict;
							continue get;
						}
					}
			}
		}
	});
var $elm_community$intdict$IntDict$member = F2(
	function (key, dict) {
		var _v0 = A2($elm_community$intdict$IntDict$get, key, dict);
		if (!_v0.$) {
			return true;
		} else {
			return false;
		}
	});
var $elm_community$graph$Graph$fromNodesAndEdges = F2(
	function (nodes_, edges_) {
		var nodeRep = A3(
			$elm$core$List$foldl,
			function (n) {
				return A2(
					$elm_community$intdict$IntDict$insert,
					n.b1,
					A3($elm_community$graph$Graph$NodeContext, n, $elm_community$intdict$IntDict$empty, $elm_community$intdict$IntDict$empty));
			},
			$elm_community$intdict$IntDict$empty,
			nodes_);
		var addEdge = F2(
			function (edge, rep) {
				var updateOutgoing = function (ctx) {
					return _Utils_update(
						ctx,
						{
							c2: A3($elm_community$intdict$IntDict$insert, edge.aV, edge.fo, ctx.c2)
						});
				};
				var updateIncoming = function (ctx) {
					return _Utils_update(
						ctx,
						{
							d1: A3($elm_community$intdict$IntDict$insert, edge.ap, edge.fo, ctx.d1)
						});
				};
				return A3(
					$elm_community$intdict$IntDict$update,
					edge.aV,
					$elm$core$Maybe$map(updateIncoming),
					A3(
						$elm_community$intdict$IntDict$update,
						edge.ap,
						$elm$core$Maybe$map(updateOutgoing),
						rep));
			});
		var addEdgeIfValid = F2(
			function (edge, rep) {
				return (A2($elm_community$intdict$IntDict$member, edge.ap, rep) && A2($elm_community$intdict$IntDict$member, edge.aV, rep)) ? A2(addEdge, edge, rep) : rep;
			});
		return A3($elm$core$List$foldl, addEdgeIfValid, nodeRep, edges_);
	});
var $author$project$GossipGraph$Relation$toEdge = function (rel) {
	return {ap: rel.ap, fo: rel, aV: rel.aV};
};
var $author$project$GossipGraph$Agent$toNode = function (agent) {
	return {b1: agent.b1, fo: agent};
};
var $author$project$GossipGraph$Parser$fromAgentsAndRelations = F2(
	function (agents, relations) {
		var nodes = A2($elm$core$List$map, $author$project$GossipGraph$Agent$toNode, agents);
		var edges = A2($elm$core$List$map, $author$project$GossipGraph$Relation$toEdge, relations);
		return A2($elm_community$graph$Graph$fromNodesAndEdges, nodes, edges);
	});
var $author$project$GossipGraph$Relation$Number = 0;
var $author$project$GossipGraph$Relation$Secret = 1;
var $author$project$GossipGraph$Parser$Separator = {$: 1};
var $author$project$GossipGraph$Parser$Token = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $elm$core$List$intersperse = F2(
	function (sep, xs) {
		if (!xs.b) {
			return _List_Nil;
		} else {
			var hd = xs.a;
			var tl = xs.b;
			var step = F2(
				function (x, rest) {
					return A2(
						$elm$core$List$cons,
						sep,
						A2($elm$core$List$cons, x, rest));
				});
			var spersed = A3($elm$core$List$foldr, step, _List_Nil, tl);
			return A2($elm$core$List$cons, hd, spersed);
		}
	});
var $author$project$GossipGraph$Parser$renderCharacterList = function (characters) {
	return $elm$core$String$fromList(
		A2(
			$elm$core$List$concatMap,
			$elm$core$String$toList,
			A2(
				$elm$core$List$intersperse,
				',',
				A2(
					$elm$core$List$map,
					function (x) {
						return $elm$core$String$fromList(
							_List_fromArray(
								['‘', x, '’']));
					},
					characters))));
};
var $author$project$GossipGraph$Parser$separators = _List_fromArray(
	[' ']);
var $author$project$GossipGraph$Parser$lexer = F2(
	function (options, string) {
		var charLexer = F2(
			function (id, characters) {
				if (!characters.b) {
					return $elm$core$Result$Ok(_List_Nil);
				} else {
					var c = characters.a;
					var cs = characters.b;
					if ($elm$core$Char$isAlpha(c)) {
						var rest = A2(charLexer, id, cs);
						if (!rest.$) {
							var tokens = rest.a;
							return $elm$core$Char$isUpper(c) ? $elm$core$Result$Ok(
								A2(
									$elm$core$List$cons,
									A3($author$project$GossipGraph$Parser$Token, 1, c, id),
									tokens)) : $elm$core$Result$Ok(
								A2(
									$elm$core$List$cons,
									A3($author$project$GossipGraph$Parser$Token, 0, c, id),
									tokens));
						} else {
							var e = rest.a;
							return $elm$core$Result$Err(e);
						}
					} else {
						if (A2($elm$core$List$member, c, $author$project$GossipGraph$Parser$separators)) {
							var rest = A2(charLexer, id + 1, cs);
							if (!rest.$) {
								var tokens = rest.a;
								return $elm$core$Result$Ok(
									A2($elm$core$List$cons, $author$project$GossipGraph$Parser$Separator, tokens));
							} else {
								var e = rest.a;
								return $elm$core$Result$Err(e);
							}
						} else {
							return $elm$core$Result$Err(
								'Only lower- and uppercase letters and separator(s) ' + ($author$project$GossipGraph$Parser$renderCharacterList($author$project$GossipGraph$Parser$separators) + ' are allowed.'));
						}
					}
				}
			});
		return A2(
			charLexer,
			0,
			$elm$core$String$toList(string));
	});
var $author$project$Utils$List$distinct = function (list) {
	var distinctAcc = F2(
		function (l, acc) {
			distinctAcc:
			while (true) {
				if (!l.b) {
					return $elm$core$List$reverse(acc);
				} else {
					var x = l.a;
					var xs = l.b;
					if (A2($elm$core$List$member, x, acc)) {
						var $temp$l = xs,
							$temp$acc = acc;
						l = $temp$l;
						acc = $temp$acc;
						continue distinctAcc;
					} else {
						var $temp$l = xs,
							$temp$acc = A2($elm$core$List$cons, x, acc);
						l = $temp$l;
						acc = $temp$acc;
						continue distinctAcc;
					}
				}
			}
		});
	return A2(distinctAcc, list, _List_Nil);
};
var $elm$core$Set$Set_elm_builtin = $elm$core$Basics$identity;
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Set$empty = $elm$core$Dict$empty;
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Set$insert = F2(
	function (key, _v0) {
		var dict = _v0;
		return A3($elm$core$Dict$insert, key, 0, dict);
	});
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $author$project$Utils$General$pluralize = F3(
	function (number, sing, plur) {
		return (number !== 1) ? ($elm$core$String$fromInt(number) + (' ' + plur)) : ('one ' + sing);
	});
var $elm$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			if (dict.$ === -2) {
				return n;
			} else {
				var left = dict.d;
				var right = dict.e;
				var $temp$n = A2($elm$core$Dict$sizeHelp, n + 1, right),
					$temp$dict = left;
				n = $temp$n;
				dict = $temp$dict;
				continue sizeHelp;
			}
		}
	});
var $elm$core$Dict$size = function (dict) {
	return A2($elm$core$Dict$sizeHelp, 0, dict);
};
var $elm$core$Set$size = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$size(dict);
};
var $author$project$GossipGraph$Parser$parseAgents = function (ts) {
	var possibleNames = A3(
		$elm$core$List$foldr,
		F2(
			function (t, acc) {
				if (!t.$) {
					var name = t.b;
					return $elm$core$Char$isUpper(name) ? A2($elm$core$Set$insert, name, acc) : acc;
				} else {
					return acc;
				}
			}),
		$elm$core$Set$empty,
		ts);
	var parser = F3(
		function (names, pos, tokens) {
			parser:
			while (true) {
				if (!tokens.b) {
					return $elm$core$Result$Ok(_List_Nil);
				} else {
					if (!tokens.a.$) {
						var _v1 = tokens.a;
						var name = _v1.b;
						var id = _v1.c;
						var rest = tokens.b;
						if ($elm$core$Char$isLower(name) || A2($elm$core$List$member, name, names)) {
							var $temp$names = names,
								$temp$pos = pos + 1,
								$temp$tokens = rest;
							names = $temp$names;
							pos = $temp$pos;
							tokens = $temp$tokens;
							continue parser;
						} else {
							var skippedCharacters = $elm$core$List$length(
								A2(
									$author$project$Utils$List$takeWhile,
									function (a) {
										return !_Utils_eq(a, $author$project$GossipGraph$Parser$Separator);
									},
									rest));
							var agent = {b1: id, cY: name};
							var _v2 = A3(
								parser,
								A2($elm$core$List$cons, name, names),
								(pos + 1) + skippedCharacters,
								A2(
									$author$project$Utils$List$dropWhile,
									function (a) {
										return !_Utils_eq(a, $author$project$GossipGraph$Parser$Separator);
									},
									rest));
							if (!_v2.$) {
								var nextTokens = _v2.a;
								return $elm$core$Result$Ok(
									A2($elm$core$List$cons, agent, nextTokens));
							} else {
								var e = _v2.a;
								return $elm$core$Result$Err(e);
							}
						}
					} else {
						var _v3 = tokens.a;
						var rest = tokens.b;
						var nextSegment = A2(
							$author$project$Utils$List$takeWhile,
							$elm$core$Basics$neq($author$project$GossipGraph$Parser$Separator),
							rest);
						var isLastToken = $elm$core$List$isEmpty(nextSegment) && $elm$core$List$isEmpty(rest);
						var hasConsectiveSeparators = $elm$core$List$isEmpty(nextSegment) && (!$elm$core$List$isEmpty(rest));
						var agentNames = A3(
							$elm$core$List$foldr,
							F2(
								function (t, acc) {
									if (!t.$) {
										var name = t.b;
										return A2($elm$core$List$cons, name, acc);
									} else {
										return acc;
									}
								}),
							_List_Nil,
							nextSegment);
						var distinctAgentNames = $author$project$Utils$List$distinct(agentNames);
						var hasDuplicates = _Utils_cmp(
							$elm$core$List$length(agentNames),
							$elm$core$List$length(distinctAgentNames)) > 0;
						if (isLastToken) {
							return $elm$core$Result$Err(
								'I expected another segment at position ' + ($elm$core$String$fromInt(pos) + ', but there\'s nothing else here.'));
						} else {
							if (hasConsectiveSeparators) {
								return $elm$core$Result$Err(
									'I found multiple separators at position ' + ($elm$core$String$fromInt(pos) + '.'));
							} else {
								if (hasDuplicates) {
									return $elm$core$Result$Err(
										'The segment starting at position ' + ($elm$core$String$fromInt(pos) + ' has a duplicate agent.'));
								} else {
									var $temp$names = names,
										$temp$pos = pos + 1,
										$temp$tokens = rest;
									names = $temp$names;
									pos = $temp$pos;
									tokens = $temp$tokens;
									continue parser;
								}
							}
						}
					}
				}
			}
		});
	var numberOfSegments = 1 + $elm$core$List$length(
		A2(
			$elm$core$List$filter,
			function (t) {
				return _Utils_eq(t, $author$project$GossipGraph$Parser$Separator);
			},
			ts));
	var validateNumberOfAgents = function (agents) {
		var numberOfNames = $elm$core$Set$size(possibleNames);
		var numberOfAgents = $elm$core$List$length(agents);
		return (!numberOfNames) ? $elm$core$Result$Err('Your input does not contain any secret relations. Therefore, I cannot determine the names of the agents. I need every agent to at least know their own secret!') : ((_Utils_cmp(numberOfAgents, numberOfSegments) < 0) ? $elm$core$Result$Err(
			'I found ' + (A3($author$project$Utils$General$pluralize, numberOfSegments, 'segment', 'segments') + (', but I only found ' + (A3($author$project$Utils$General$pluralize, numberOfAgents, 'unique agent', 'unique agents') + '.')))) : ((!_Utils_eq(numberOfAgents, numberOfNames)) ? $elm$core$Result$Err(
			'Your input contains the names of ' + (A3($author$project$Utils$General$pluralize, numberOfNames, 'name', 'names') + (' agents, but I was only able to identify segments representing the relations of the following ' + (A3($author$project$Utils$General$pluralize, numberOfAgents, 'agent', 'agents') + (': ' + ($author$project$GossipGraph$Parser$renderCharacterList(
				A2(
					$elm$core$List$map,
					function (a) {
						return a.cY;
					},
					agents)) + '. Make sure every segment contains the identity relation for the agent it represents!')))))) : $elm$core$Result$Ok(agents)));
	};
	return A2(
		$elm$core$Result$andThen,
		validateNumberOfAgents,
		A3(parser, _List_Nil, 1, ts));
};
var $author$project$GossipGraph$Parser$parseRelations = F2(
	function (agents, tokens) {
		var parser = F2(
			function (pos, ts) {
				if (!ts.b) {
					return $elm$core$Result$Ok(_List_Nil);
				} else {
					if (ts.a.$ === 1) {
						var _v1 = ts.a;
						var rest = ts.b;
						return A2($author$project$GossipGraph$Parser$parseRelations, agents, rest);
					} else {
						var _v2 = ts.a;
						var kind = _v2.a;
						var name = _v2.b;
						var id = _v2.c;
						var rest = ts.b;
						var _v3 = A2($author$project$GossipGraph$Parser$parseRelations, agents, rest);
						if (!_v3.$) {
							var relations = _v3.a;
							return A2(
								$elm$core$Result$map,
								function (agent) {
									return A2(
										$elm$core$List$cons,
										{ap: id, d8: kind, aV: agent.b1},
										relations);
								},
								A2($author$project$GossipGraph$Agent$fromChar, agents, name));
						} else {
							var e = _v3.a;
							return $elm$core$Result$Err(e);
						}
					}
				}
			});
		return A2(parser, 1, tokens);
	});
var $elm$core$Char$fromCode = _Char_fromCode;
var $elm_community$intdict$IntDict$foldr = F3(
	function (f, acc, dict) {
		foldr:
		while (true) {
			switch (dict.$) {
				case 0:
					return acc;
				case 1:
					var l = dict.a;
					return A3(f, l.d7, l.eO, acc);
				default:
					var i = dict.a;
					var $temp$f = f,
						$temp$acc = A3($elm_community$intdict$IntDict$foldr, f, acc, i.e),
						$temp$dict = i.d;
					f = $temp$f;
					acc = $temp$acc;
					dict = $temp$dict;
					continue foldr;
			}
		}
	});
var $elm_community$intdict$IntDict$values = function (dict) {
	return A3(
		$elm_community$intdict$IntDict$foldr,
		F3(
			function (key, value, valueList) {
				return A2($elm$core$List$cons, value, valueList);
			}),
		_List_Nil,
		dict);
};
var $author$project$GossipGraph$Relation$fromNodeContext = function (context) {
	return $elm_community$intdict$IntDict$values(context.c2);
};
var $elm$core$List$sortBy = _List_sortBy;
var $elm$core$Char$toLower = _Char_toLower;
var $author$project$GossipGraph$Parser$adjacencyToCanonicalString = F2(
	function (context, acc) {
		var toCharacter = F2(
			function (_v0, acc2) {
				var id = _v0.a;
				var kind = _v0.b;
				return function (c) {
					return _Utils_ap(
						$elm$core$String$fromChar(c),
						acc2);
				}(
					((!kind) ? $elm$core$Char$toLower : $elm$core$Char$toUpper)(
						$elm$core$Char$fromCode(id + 65)));
			});
		var relations = A2(
			$elm$core$List$sortBy,
			$elm$core$Tuple$first,
			A2(
				$elm$core$List$map,
				function (r) {
					return _Utils_Tuple2(r.aV, r.d8);
				},
				$author$project$GossipGraph$Relation$fromNodeContext(context)));
		return A2(
			$elm$core$List$cons,
			A3($elm$core$List$foldr, toCharacter, '', relations),
			acc);
	});
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (!maybeValue.$) {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm_community$graph$Graph$unGraph = function (graph) {
	var rep = graph;
	return rep;
};
var $elm_community$graph$Graph$get = function (nodeId) {
	return A2(
		$elm$core$Basics$composeR,
		$elm_community$graph$Graph$unGraph,
		$elm_community$intdict$IntDict$get(nodeId));
};
var $elm_community$intdict$IntDict$findMax = function (dict) {
	findMax:
	while (true) {
		switch (dict.$) {
			case 0:
				return $elm$core$Maybe$Nothing;
			case 1:
				var l = dict.a;
				return $elm$core$Maybe$Just(
					_Utils_Tuple2(l.d7, l.eO));
			default:
				var i = dict.a;
				var $temp$dict = i.e;
				dict = $temp$dict;
				continue findMax;
		}
	}
};
var $elm_community$intdict$IntDict$findMin = function (dict) {
	findMin:
	while (true) {
		switch (dict.$) {
			case 0:
				return $elm$core$Maybe$Nothing;
			case 1:
				var l = dict.a;
				return $elm$core$Maybe$Just(
					_Utils_Tuple2(l.d7, l.eO));
			default:
				var i = dict.a;
				var $temp$dict = i.d;
				dict = $temp$dict;
				continue findMin;
		}
	}
};
var $elm_community$graph$Graph$nodeIdRange = function (graph) {
	return A2(
		$elm$core$Maybe$andThen,
		function (_v0) {
			var min = _v0.a;
			return A2(
				$elm$core$Maybe$andThen,
				function (_v1) {
					var max = _v1.a;
					return $elm$core$Maybe$Just(
						_Utils_Tuple2(min, max));
				},
				$elm_community$intdict$IntDict$findMax(
					$elm_community$graph$Graph$unGraph(graph)));
		},
		$elm_community$intdict$IntDict$findMin(
			$elm_community$graph$Graph$unGraph(graph)));
};
var $elm_community$intdict$IntDict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			switch (dict.$) {
				case 0:
					return acc;
				case 1:
					var l = dict.a;
					return A3(f, l.d7, l.eO, acc);
				default:
					var i = dict.a;
					var $temp$f = f,
						$temp$acc = A3($elm_community$intdict$IntDict$foldl, f, acc, i.d),
						$temp$dict = i.e;
					f = $temp$f;
					acc = $temp$acc;
					dict = $temp$dict;
					continue foldl;
			}
		}
	});
var $elm_community$graph$Graph$applyEdgeDiff = F3(
	function (nodeId, diff, graphRep) {
		var updateOutgoingEdge = F2(
			function (upd, node) {
				return _Utils_update(
					node,
					{
						c2: A3($elm_community$intdict$IntDict$update, nodeId, upd, node.c2)
					});
			});
		var updateIncomingEdge = F2(
			function (upd, node) {
				return _Utils_update(
					node,
					{
						d1: A3($elm_community$intdict$IntDict$update, nodeId, upd, node.d1)
					});
			});
		var flippedFoldl = F3(
			function (f, dict, acc) {
				return A3($elm_community$intdict$IntDict$foldl, f, acc, dict);
			});
		var edgeUpdateToMaybe = function (edgeUpdate) {
			if (!edgeUpdate.$) {
				var lbl = edgeUpdate.a;
				return $elm$core$Maybe$Just(lbl);
			} else {
				return $elm$core$Maybe$Nothing;
			}
		};
		var updateAdjacency = F3(
			function (updateEdge, updatedId, edgeUpdate) {
				var updateLbl = updateEdge(
					$elm$core$Basics$always(
						edgeUpdateToMaybe(edgeUpdate)));
				return A2(
					$elm_community$intdict$IntDict$update,
					updatedId,
					$elm$core$Maybe$map(updateLbl));
			});
		return A3(
			flippedFoldl,
			updateAdjacency(updateOutgoingEdge),
			diff.c2,
			A3(
				flippedFoldl,
				updateAdjacency(updateIncomingEdge),
				diff.d1,
				graphRep));
	});
var $elm_community$graph$Graph$Insert = function (a) {
	return {$: 0, a: a};
};
var $elm_community$graph$Graph$Remove = function (a) {
	return {$: 1, a: a};
};
var $elm_community$graph$Graph$crashHack = function (msg) {
	crashHack:
	while (true) {
		var $temp$msg = msg;
		msg = $temp$msg;
		continue crashHack;
	}
};
var $elm_community$graph$Graph$emptyDiff = {d1: $elm_community$intdict$IntDict$empty, c2: $elm_community$intdict$IntDict$empty};
var $elm_community$graph$Graph$computeEdgeDiff = F2(
	function (old, _new) {
		var collectUpdates = F3(
			function (edgeUpdate, updatedId, label) {
				var replaceUpdate = function (old_) {
					var _v5 = _Utils_Tuple2(
						old_,
						edgeUpdate(label));
					if (!_v5.a.$) {
						if (_v5.a.a.$ === 1) {
							if (!_v5.b.$) {
								var oldLbl = _v5.a.a.a;
								var newLbl = _v5.b.a;
								return _Utils_eq(oldLbl, newLbl) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(
									$elm_community$graph$Graph$Insert(newLbl));
							} else {
								return $elm_community$graph$Graph$crashHack('Graph.computeEdgeDiff: Collected two removals for the same edge. This is an error in the implementation of Graph and you should file a bug report!');
							}
						} else {
							return $elm_community$graph$Graph$crashHack('Graph.computeEdgeDiff: Collected inserts before removals. This is an error in the implementation of Graph and you should file a bug report!');
						}
					} else {
						var _v6 = _v5.a;
						var eu = _v5.b;
						return $elm$core$Maybe$Just(eu);
					}
				};
				return A2($elm_community$intdict$IntDict$update, updatedId, replaceUpdate);
			});
		var collect = F3(
			function (edgeUpdate, adj, updates) {
				return A3(
					$elm_community$intdict$IntDict$foldl,
					collectUpdates(edgeUpdate),
					updates,
					adj);
			});
		var _v0 = _Utils_Tuple2(old, _new);
		if (_v0.a.$ === 1) {
			if (_v0.b.$ === 1) {
				var _v1 = _v0.a;
				var _v2 = _v0.b;
				return $elm_community$graph$Graph$emptyDiff;
			} else {
				var _v4 = _v0.a;
				var ins = _v0.b.a;
				return {
					d1: A3(collect, $elm_community$graph$Graph$Insert, ins.c2, $elm_community$intdict$IntDict$empty),
					c2: A3(collect, $elm_community$graph$Graph$Insert, ins.d1, $elm_community$intdict$IntDict$empty)
				};
			}
		} else {
			if (_v0.b.$ === 1) {
				var rem = _v0.a.a;
				var _v3 = _v0.b;
				return {
					d1: A3(collect, $elm_community$graph$Graph$Remove, rem.c2, $elm_community$intdict$IntDict$empty),
					c2: A3(collect, $elm_community$graph$Graph$Remove, rem.d1, $elm_community$intdict$IntDict$empty)
				};
			} else {
				var rem = _v0.a.a;
				var ins = _v0.b.a;
				return _Utils_eq(rem, ins) ? $elm_community$graph$Graph$emptyDiff : {
					d1: A3(
						collect,
						$elm_community$graph$Graph$Insert,
						ins.c2,
						A3(collect, $elm_community$graph$Graph$Remove, rem.c2, $elm_community$intdict$IntDict$empty)),
					c2: A3(
						collect,
						$elm_community$graph$Graph$Insert,
						ins.d1,
						A3(collect, $elm_community$graph$Graph$Remove, rem.d1, $elm_community$intdict$IntDict$empty))
				};
			}
		}
	});
var $elm_community$intdict$IntDict$filter = F2(
	function (predicate, dict) {
		var add = F3(
			function (k, v, d) {
				return A2(predicate, k, v) ? A3($elm_community$intdict$IntDict$insert, k, v, d) : d;
			});
		return A3($elm_community$intdict$IntDict$foldl, add, $elm_community$intdict$IntDict$empty, dict);
	});
var $elm_community$graph$Graph$update = F2(
	function (nodeId, updater) {
		var wrappedUpdater = function (rep) {
			var old = A2($elm_community$intdict$IntDict$get, nodeId, rep);
			var filterInvalidEdges = function (ctx) {
				return $elm_community$intdict$IntDict$filter(
					F2(
						function (id, _v0) {
							return _Utils_eq(id, ctx.ej.b1) || A2($elm_community$intdict$IntDict$member, id, rep);
						}));
			};
			var cleanUpEdges = function (ctx) {
				return _Utils_update(
					ctx,
					{
						d1: A2(filterInvalidEdges, ctx, ctx.d1),
						c2: A2(filterInvalidEdges, ctx, ctx.c2)
					});
			};
			var _new = A2(
				$elm$core$Maybe$map,
				cleanUpEdges,
				updater(old));
			var diff = A2($elm_community$graph$Graph$computeEdgeDiff, old, _new);
			return A3(
				$elm_community$intdict$IntDict$update,
				nodeId,
				$elm$core$Basics$always(_new),
				A3($elm_community$graph$Graph$applyEdgeDiff, nodeId, diff, rep));
		};
		return A2(
			$elm$core$Basics$composeR,
			$elm_community$graph$Graph$unGraph,
			A2($elm$core$Basics$composeR, wrappedUpdater, $elm$core$Basics$identity));
	});
var $elm_community$graph$Graph$remove = F2(
	function (nodeId, graph) {
		return A3(
			$elm_community$graph$Graph$update,
			nodeId,
			$elm$core$Basics$always($elm$core$Maybe$Nothing),
			graph);
	});
var $elm_community$graph$Graph$fold = F3(
	function (f, acc, graph) {
		var go = F2(
			function (acc1, graph1) {
				go:
				while (true) {
					var maybeContext = A2(
						$elm$core$Maybe$andThen,
						function (id) {
							return A2($elm_community$graph$Graph$get, id, graph);
						},
						A2(
							$elm$core$Maybe$map,
							$elm$core$Tuple$first,
							$elm_community$graph$Graph$nodeIdRange(graph1)));
					if (!maybeContext.$) {
						var ctx = maybeContext.a;
						var $temp$acc1 = A2(f, ctx, acc1),
							$temp$graph1 = A2($elm_community$graph$Graph$remove, ctx.ej.b1, graph1);
						acc1 = $temp$acc1;
						graph1 = $temp$graph1;
						continue go;
					} else {
						return acc1;
					}
				}
			});
		return A2(go, acc, graph);
	});
var $author$project$GossipGraph$Parser$toCanonicalString = function (graph) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Basics$append,
		'',
		A2(
			$elm$core$List$intersperse,
			' ',
			$elm$core$List$reverse(
				A3($elm_community$graph$Graph$fold, $author$project$GossipGraph$Parser$adjacencyToCanonicalString, _List_Nil, graph))));
};
var $elm$core$Result$withDefault = F2(
	function (def, result) {
		if (!result.$) {
			var a = result.a;
			return a;
		} else {
			return def;
		}
	});
var $author$project$Main$changeGossipGraph = F2(
	function (input, model) {
		var lexResult = A2(
			$author$project$GossipGraph$Parser$lexer,
			{fK: ' '},
			input);
		var agents = A2($elm$core$Result$andThen, $author$project$GossipGraph$Parser$parseAgents, lexResult);
		var callSequence = A2(
			$elm$core$Result$andThen,
			$author$project$CallSequence$Parser$parse(model.ai),
			agents);
		var relations = function () {
			var _v1 = _Utils_Tuple2(lexResult, agents);
			if (_v1.a.$ === 1) {
				if (!_v1.b.$) {
					var e = _v1.a.a;
					return $elm$core$Result$Err(e);
				} else {
					return $elm$core$Result$Err('Something went wrong when parsing the relations');
				}
			} else {
				if (!_v1.b.$) {
					var tokens = _v1.a.a;
					var agts = _v1.b.a;
					return A2($author$project$GossipGraph$Parser$parseRelations, agts, tokens);
				} else {
					var e = _v1.b.a;
					return $elm$core$Result$Err(e);
				}
			}
		}();
		var graph = function () {
			var _v0 = _Utils_Tuple2(agents, relations);
			if (!_v0.a.$) {
				if (!_v0.b.$) {
					var agts = _v0.a.a;
					var rels = _v0.b.a;
					return $elm$core$Result$Ok(
						A2($author$project$GossipGraph$Parser$fromAgentsAndRelations, agts, rels));
				} else {
					var e = _v0.b.a;
					return $elm$core$Result$Err(e);
				}
			} else {
				var e = _v0.a.a;
				return $elm$core$Result$Err(e);
			}
		}();
		var canonical = $author$project$GossipGraph$Parser$toCanonicalString(
			A2($elm$core$Result$withDefault, $elm_community$graph$Graph$empty, graph));
		return _Utils_Tuple2(
			_Utils_update(
				model,
				{
					aL: agents,
					ao: callSequence,
					bW: canonical,
					t: graph,
					w: $zwilias$elm_rosetree$Tree$singleton($author$project$GossipProtocol$GossipProtocol$Root),
					aa: input,
					bD: relations
				}),
			$elm$core$Platform$Cmd$none);
	});
var $author$project$GossipGraph$Call$includes = F2(
	function (call, agent) {
		return _Utils_eq(call.ap, agent) || _Utils_eq(call.aV, agent);
	});
var $author$project$CallSequence$CallSequence$containing = F2(
	function (sequence, agent) {
		containing:
		while (true) {
			if (!sequence.b) {
				return _List_Nil;
			} else {
				var call = sequence.a;
				var calls = sequence.b;
				if (A2($author$project$GossipGraph$Call$includes, call, agent)) {
					return A2(
						$elm$core$List$cons,
						call,
						A2($author$project$CallSequence$CallSequence$containing, calls, agent));
				} else {
					var $temp$sequence = calls,
						$temp$agent = agent;
					sequence = $temp$sequence;
					agent = $temp$agent;
					continue containing;
				}
			}
		}
	});
var $author$project$GossipProtocol$Conditions$Constituents$hasCalled = F3(
	function (x, y, sequence) {
		return A2(
			$elm$core$List$any,
			function (c) {
				return _Utils_eq(c.ap, x) && _Utils_eq(c.aV, y);
			},
			sequence);
	});
var $author$project$GossipProtocol$Conditions$Constituents$wasCalledBy = F3(
	function (x, y, sequence) {
		return A2(
			$elm$core$List$any,
			function (c) {
				return _Utils_eq(c.ap, y) && _Utils_eq(c.aV, x);
			},
			sequence);
	});
var $author$project$GossipProtocol$Conditions$Predefined$co = F3(
	function (_v0, _v1, sequence) {
		var x = _v0.a;
		var y = _v0.b;
		var sigma_x = A2($author$project$CallSequence$CallSequence$containing, sequence, x);
		return (!A3($author$project$GossipProtocol$Conditions$Constituents$hasCalled, x, y, sigma_x)) && (!A3($author$project$GossipProtocol$Conditions$Constituents$wasCalledBy, x, y, sigma_x));
	});
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $author$project$GossipGraph$Relation$atLeast = F2(
	function (kind, rel) {
		return (!kind) || (_Utils_eq(rel.d8, kind) || ((!kind) && (rel.d8 === 1)));
	});
var $author$project$GossipGraph$Relation$knows = F4(
	function (x, y, kind, relation) {
		return _Utils_eq(relation.ap, x) && (_Utils_eq(relation.aV, y) && A2($author$project$GossipGraph$Relation$atLeast, kind, relation));
	});
var $author$project$GossipProtocol$Conditions$Constituents$knowsSecret = F3(
	function (x, y, relations) {
		return A2(
			$elm$core$List$any,
			function (r) {
				return A4($author$project$GossipGraph$Relation$knows, x, y, 1, r);
			},
			relations);
	});
var $author$project$GossipProtocol$Conditions$Predefined$lns = F3(
	function (_v0, relations, _v1) {
		var x = _v0.a;
		var y = _v0.b;
		return !A3($author$project$GossipProtocol$Conditions$Constituents$knowsSecret, x, y, relations);
	});
var $author$project$GossipProtocol$Conditions$Constituents$empty = function (sequence) {
	return $elm$core$List$isEmpty(sequence);
};
var $author$project$GossipProtocol$Conditions$Constituents$lastFrom = F2(
	function (agent, sequence) {
		var _v0 = $elm$core$List$head(sequence);
		if (!_v0.$) {
			var call = _v0.a;
			return _Utils_eq(call.ap, agent);
		} else {
			return false;
		}
	});
var $author$project$GossipProtocol$Conditions$Predefined$spi = F3(
	function (_v0, _v1, sequence) {
		var x = _v0.a;
		var sigma_x = A2($author$project$CallSequence$CallSequence$containing, sequence, x);
		return $author$project$GossipProtocol$Conditions$Constituents$empty(sigma_x) || A2($author$project$GossipProtocol$Conditions$Constituents$lastFrom, x, sigma_x);
	});
var $author$project$GossipProtocol$Conditions$Constituents$lastTo = F2(
	function (agent, sequence) {
		var _v0 = $elm$core$List$head(sequence);
		if (!_v0.$) {
			var call = _v0.a;
			return _Utils_eq(call.aV, agent);
		} else {
			return false;
		}
	});
var $author$project$GossipProtocol$Conditions$Predefined$tok = F3(
	function (_v0, _v1, sequence) {
		var x = _v0.a;
		var sigma_x = A2($author$project$CallSequence$CallSequence$containing, sequence, x);
		return $author$project$GossipProtocol$Conditions$Constituents$empty(sigma_x) || A2($author$project$GossipProtocol$Conditions$Constituents$lastTo, x, sigma_x);
	});
var $author$project$GossipProtocol$Conditions$Predefined$wco = F3(
	function (_v0, _v1, sequence) {
		var x = _v0.a;
		var y = _v0.b;
		var sigma_x = A2($author$project$CallSequence$CallSequence$containing, sequence, x);
		return !A3($author$project$GossipProtocol$Conditions$Constituents$hasCalled, x, y, sigma_x);
	});
var $author$project$GossipProtocol$Conditions$Predefined$condition = $elm$core$Dict$fromList(
	_List_fromArray(
		[
			_Utils_Tuple2('any', $author$project$GossipProtocol$Conditions$Predefined$any),
			_Utils_Tuple2('tok', $author$project$GossipProtocol$Conditions$Predefined$tok),
			_Utils_Tuple2('spi', $author$project$GossipProtocol$Conditions$Predefined$spi),
			_Utils_Tuple2('co', $author$project$GossipProtocol$Conditions$Predefined$co),
			_Utils_Tuple2('wco', $author$project$GossipProtocol$Conditions$Predefined$wco),
			_Utils_Tuple2('lns', $author$project$GossipProtocol$Conditions$Predefined$lns)
		]));
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $author$project$Main$changeProtocol = F2(
	function (protocolName, model) {
		var condition = A2($elm$core$Dict$get, protocolName, $author$project$GossipProtocol$Conditions$Predefined$condition);
		if (!condition.$) {
			var c = condition.a;
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{
						w: $zwilias$elm_rosetree$Tree$singleton($author$project$GossipProtocol$GossipProtocol$Root),
						aT: c,
						as: protocolName
					}),
				$elm$core$Platform$Cmd$none);
		} else {
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{
						w: $zwilias$elm_rosetree$Tree$singleton($author$project$GossipProtocol$GossipProtocol$Root),
						aT: $author$project$GossipProtocol$Conditions$Predefined$any,
						as: 'any'
					}),
				$elm$core$Platform$Cmd$none);
		}
	});
var $elm$core$Basics$clamp = F3(
	function (low, high, number) {
		return (_Utils_cmp(number, low) < 0) ? low : ((_Utils_cmp(number, high) > 0) ? high : number);
	});
var $author$project$GossipProtocol$GossipProtocol$Node = function (a) {
	return {$: 1, a: a};
};
var $elm_community$intdict$IntDict$Disjunct = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $elm_community$intdict$IntDict$Left = 0;
var $elm_community$intdict$IntDict$Parent = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm_community$intdict$IntDict$Right = 1;
var $elm_community$intdict$IntDict$SamePrefix = {$: 0};
var $elm_community$intdict$IntDict$combineBits = F3(
	function (a, b, mask) {
		return (a & (~mask)) | (b & mask);
	});
var $elm_community$intdict$IntDict$mostSignificantBranchingBit = F2(
	function (a, b) {
		return (_Utils_eq(a, $elm_community$intdict$IntDict$signBit) || _Utils_eq(b, $elm_community$intdict$IntDict$signBit)) ? $elm_community$intdict$IntDict$signBit : A2($elm$core$Basics$max, a, b);
	});
var $elm_community$intdict$IntDict$determineBranchRelation = F2(
	function (l, r) {
		var rp = r.i;
		var lp = l.i;
		var mask = $elm_community$intdict$IntDict$highestBitSet(
			A2($elm_community$intdict$IntDict$mostSignificantBranchingBit, lp.a$, rp.a$));
		var modifiedRightPrefix = A3($elm_community$intdict$IntDict$combineBits, rp.al, ~lp.al, mask);
		var prefix = A2($elm_community$intdict$IntDict$lcp, lp.al, modifiedRightPrefix);
		var childEdge = F2(
			function (branchPrefix, c) {
				return A2($elm_community$intdict$IntDict$isBranchingBitSet, branchPrefix, c.i.al) ? 1 : 0;
			});
		return _Utils_eq(lp, rp) ? $elm_community$intdict$IntDict$SamePrefix : (_Utils_eq(prefix, lp) ? A2(
			$elm_community$intdict$IntDict$Parent,
			0,
			A2(childEdge, l.i, r)) : (_Utils_eq(prefix, rp) ? A2(
			$elm_community$intdict$IntDict$Parent,
			1,
			A2(childEdge, r.i, l)) : A2(
			$elm_community$intdict$IntDict$Disjunct,
			prefix,
			A2(childEdge, prefix, l))));
	});
var $elm_community$intdict$IntDict$remove = F2(
	function (key, dict) {
		return A3(
			$elm_community$intdict$IntDict$update,
			key,
			$elm$core$Basics$always($elm$core$Maybe$Nothing),
			dict);
	});
var $elm_community$intdict$IntDict$merge = F6(
	function (left, both, right, l, r, acc) {
		var m = A3($elm_community$intdict$IntDict$merge, left, both, right);
		var _v0 = _Utils_Tuple2(l, r);
		_v0$1:
		while (true) {
			_v0$2:
			while (true) {
				switch (_v0.a.$) {
					case 0:
						var _v1 = _v0.a;
						return A3($elm_community$intdict$IntDict$foldl, right, acc, r);
					case 1:
						switch (_v0.b.$) {
							case 0:
								break _v0$1;
							case 1:
								break _v0$2;
							default:
								break _v0$2;
						}
					default:
						switch (_v0.b.$) {
							case 0:
								break _v0$1;
							case 1:
								var r2 = _v0.b.a;
								var _v4 = A2($elm_community$intdict$IntDict$get, r2.d7, l);
								if (_v4.$ === 1) {
									return A3(
										m,
										l,
										$elm_community$intdict$IntDict$Empty,
										A3(right, r2.d7, r2.eO, acc));
								} else {
									var v = _v4.a;
									return A3(
										m,
										A2($elm_community$intdict$IntDict$remove, r2.d7, l),
										$elm_community$intdict$IntDict$Empty,
										A4(both, r2.d7, v, r2.eO, acc));
								}
							default:
								var il = _v0.a.a;
								var ir = _v0.b.a;
								var _v5 = A2($elm_community$intdict$IntDict$determineBranchRelation, il, ir);
								switch (_v5.$) {
									case 0:
										return A3(
											m,
											il.e,
											ir.e,
											A3(m, il.d, ir.d, acc));
									case 1:
										if (!_v5.a) {
											if (!_v5.b) {
												var _v6 = _v5.a;
												var _v7 = _v5.b;
												return A3(
													m,
													il.e,
													$elm_community$intdict$IntDict$Empty,
													A3(m, il.d, r, acc));
											} else {
												var _v8 = _v5.a;
												var _v9 = _v5.b;
												return A3(
													m,
													il.e,
													r,
													A3(m, il.d, $elm_community$intdict$IntDict$Empty, acc));
											}
										} else {
											if (!_v5.b) {
												var _v10 = _v5.a;
												var _v11 = _v5.b;
												return A3(
													m,
													$elm_community$intdict$IntDict$Empty,
													ir.e,
													A3(m, l, ir.d, acc));
											} else {
												var _v12 = _v5.a;
												var _v13 = _v5.b;
												return A3(
													m,
													l,
													ir.e,
													A3(m, $elm_community$intdict$IntDict$Empty, ir.d, acc));
											}
										}
									default:
										if (!_v5.b) {
											var _v14 = _v5.b;
											return A3(
												m,
												$elm_community$intdict$IntDict$Empty,
												r,
												A3(m, l, $elm_community$intdict$IntDict$Empty, acc));
										} else {
											var _v15 = _v5.b;
											return A3(
												m,
												l,
												$elm_community$intdict$IntDict$Empty,
												A3(m, $elm_community$intdict$IntDict$Empty, r, acc));
										}
								}
						}
				}
			}
			var l2 = _v0.a.a;
			var _v3 = A2($elm_community$intdict$IntDict$get, l2.d7, r);
			if (_v3.$ === 1) {
				return A3(
					m,
					$elm_community$intdict$IntDict$Empty,
					r,
					A3(left, l2.d7, l2.eO, acc));
			} else {
				var v = _v3.a;
				return A3(
					m,
					$elm_community$intdict$IntDict$Empty,
					A2($elm_community$intdict$IntDict$remove, l2.d7, r),
					A4(both, l2.d7, l2.eO, v, acc));
			}
		}
		var _v2 = _v0.b;
		return A3($elm_community$intdict$IntDict$foldl, left, acc, l);
	});
var $author$project$GossipGraph$Call$execute = F2(
	function (graph, _v0) {
		var from = _v0.ap;
		var to = _v0.aV;
		var knowledge = function (id) {
			return A2($elm_community$graph$Graph$get, id, graph);
		};
		var merge = F2(
			function (newId, currentContext) {
				var newContext = knowledge(newId);
				var _v1 = _Utils_Tuple2(newContext, currentContext);
				if ((!_v1.a.$) && (!_v1.b.$)) {
					var _new = _v1.a.a;
					var current = _v1.b.a;
					return $elm$core$Maybe$Just(
						_Utils_update(
							current,
							{
								c2: A6(
									$elm_community$intdict$IntDict$merge,
									F3(
										function (k, c, acc) {
											return A3($elm_community$intdict$IntDict$insert, k, c, acc);
										}),
									F4(
										function (k, c, n, acc) {
											return (c.d8 === 1) ? A3($elm_community$intdict$IntDict$insert, k, c, acc) : ((n.d8 === 1) ? A3(
												$elm_community$intdict$IntDict$insert,
												k,
												_Utils_update(
													n,
													{ap: current.ej.b1}),
												acc) : A3($elm_community$intdict$IntDict$insert, k, c, acc));
										}),
									F3(
										function (k, n, acc) {
											return A3(
												$elm_community$intdict$IntDict$insert,
												k,
												_Utils_update(
													n,
													{ap: current.ej.b1}),
												acc);
										}),
									current.c2,
									_new.c2,
									$elm_community$intdict$IntDict$empty)
							}));
				} else {
					return $elm$core$Maybe$Nothing;
				}
			});
		return A3(
			$elm_community$graph$Graph$update,
			to,
			merge(from),
			A3(
				$elm_community$graph$Graph$update,
				from,
				merge(to),
				graph));
	});
var $zwilias$elm_rosetree$Tree$label = function (_v0) {
	var v = _v0.a;
	return v;
};
var $zwilias$elm_rosetree$Tree$Zipper$tree = function (_v0) {
	var focus = _v0.r;
	return focus;
};
var $zwilias$elm_rosetree$Tree$Zipper$label = function (zipper) {
	return $zwilias$elm_rosetree$Tree$label(
		$zwilias$elm_rosetree$Tree$Zipper$tree(zipper));
};
var $zwilias$elm_rosetree$Tree$Zipper$find = F3(
	function (predicate, move, zipper) {
		find:
		while (true) {
			var _v0 = move(zipper);
			if (!_v0.$) {
				var next = _v0.a;
				if (predicate(
					$zwilias$elm_rosetree$Tree$Zipper$label(next))) {
					return $elm$core$Maybe$Just(next);
				} else {
					var $temp$predicate = predicate,
						$temp$move = move,
						$temp$zipper = next;
					predicate = $temp$predicate;
					move = $temp$move;
					zipper = $temp$zipper;
					continue find;
				}
			} else {
				return $elm$core$Maybe$Nothing;
			}
		}
	});
var $zwilias$elm_rosetree$Tree$Zipper$Zipper = $elm$core$Basics$identity;
var $zwilias$elm_rosetree$Tree$children = function (_v0) {
	var c = _v0.b;
	return c;
};
var $zwilias$elm_rosetree$Tree$Zipper$firstChild = function (_v0) {
	var zipper = _v0;
	var _v1 = $zwilias$elm_rosetree$Tree$children(zipper.r);
	if (!_v1.b) {
		return $elm$core$Maybe$Nothing;
	} else {
		var c = _v1.a;
		var cs = _v1.b;
		return $elm$core$Maybe$Just(
			{
				o: cs,
				q: _List_Nil,
				D: A2(
					$elm$core$List$cons,
					{
						o: zipper.o,
						q: zipper.q,
						fo: $zwilias$elm_rosetree$Tree$label(zipper.r)
					},
					zipper.D),
				r: c
			});
	}
};
var $zwilias$elm_rosetree$Tree$Zipper$firstOf = F2(
	function (options, v) {
		firstOf:
		while (true) {
			if (!options.b) {
				return $elm$core$Maybe$Nothing;
			} else {
				var option = options.a;
				var rest = options.b;
				var _v1 = option(v);
				if (!_v1.$) {
					var r = _v1.a;
					return $elm$core$Maybe$Just(r);
				} else {
					var $temp$options = rest,
						$temp$v = v;
					options = $temp$options;
					v = $temp$v;
					continue firstOf;
				}
			}
		}
	});
var $zwilias$elm_rosetree$Tree$Zipper$nextSibling = function (_v0) {
	var zipper = _v0;
	var _v1 = zipper.o;
	if (!_v1.b) {
		return $elm$core$Maybe$Nothing;
	} else {
		var next = _v1.a;
		var rest = _v1.b;
		return $elm$core$Maybe$Just(
			{
				o: rest,
				q: A2($elm$core$List$cons, zipper.r, zipper.q),
				D: zipper.D,
				r: next
			});
	}
};
var $zwilias$elm_rosetree$Tree$tree = $zwilias$elm_rosetree$Tree$Tree;
var $zwilias$elm_rosetree$Tree$Zipper$reconstruct = F4(
	function (focus, before, after, l) {
		return A2(
			$zwilias$elm_rosetree$Tree$tree,
			l,
			_Utils_ap(
				$elm$core$List$reverse(before),
				_Utils_ap(
					_List_fromArray(
						[focus]),
					after)));
	});
var $zwilias$elm_rosetree$Tree$Zipper$parent = function (_v0) {
	var zipper = _v0;
	var _v1 = zipper.D;
	if (!_v1.b) {
		return $elm$core$Maybe$Nothing;
	} else {
		var crumb = _v1.a;
		var rest = _v1.b;
		return $elm$core$Maybe$Just(
			{
				o: crumb.o,
				q: crumb.q,
				D: rest,
				r: A4($zwilias$elm_rosetree$Tree$Zipper$reconstruct, zipper.r, zipper.q, zipper.o, crumb.fo)
			});
	}
};
var $zwilias$elm_rosetree$Tree$Zipper$nextSiblingOfAncestor = function (zipper) {
	nextSiblingOfAncestor:
	while (true) {
		var _v0 = $zwilias$elm_rosetree$Tree$Zipper$parent(zipper);
		if (_v0.$ === 1) {
			return $elm$core$Maybe$Nothing;
		} else {
			var parent_ = _v0.a;
			var _v1 = $zwilias$elm_rosetree$Tree$Zipper$nextSibling(parent_);
			if (_v1.$ === 1) {
				var $temp$zipper = parent_;
				zipper = $temp$zipper;
				continue nextSiblingOfAncestor;
			} else {
				var s = _v1.a;
				return $elm$core$Maybe$Just(s);
			}
		}
	}
};
var $zwilias$elm_rosetree$Tree$Zipper$forward = function (zipper) {
	return A2(
		$zwilias$elm_rosetree$Tree$Zipper$firstOf,
		_List_fromArray(
			[$zwilias$elm_rosetree$Tree$Zipper$firstChild, $zwilias$elm_rosetree$Tree$Zipper$nextSibling, $zwilias$elm_rosetree$Tree$Zipper$nextSiblingOfAncestor]),
		zipper);
};
var $zwilias$elm_rosetree$Tree$Zipper$findNext = F2(
	function (f, zipper) {
		return A3($zwilias$elm_rosetree$Tree$Zipper$find, f, $zwilias$elm_rosetree$Tree$Zipper$forward, zipper);
	});
var $zwilias$elm_rosetree$Tree$Zipper$previousSibling = function (_v0) {
	var zipper = _v0;
	var _v1 = zipper.q;
	if (!_v1.b) {
		return $elm$core$Maybe$Nothing;
	} else {
		var previous = _v1.a;
		var rest = _v1.b;
		return $elm$core$Maybe$Just(
			{
				o: A2($elm$core$List$cons, zipper.r, zipper.o),
				q: rest,
				D: zipper.D,
				r: previous
			});
	}
};
var $zwilias$elm_rosetree$Tree$Zipper$firstSibling = function (zipper) {
	firstSibling:
	while (true) {
		var _v0 = $zwilias$elm_rosetree$Tree$Zipper$previousSibling(zipper);
		if (_v0.$ === 1) {
			return zipper;
		} else {
			var z = _v0.a;
			var $temp$zipper = z;
			zipper = $temp$zipper;
			continue firstSibling;
		}
	}
};
var $zwilias$elm_rosetree$Tree$Zipper$root = function (zipper) {
	root:
	while (true) {
		var _v0 = $zwilias$elm_rosetree$Tree$Zipper$parent(zipper);
		if (_v0.$ === 1) {
			return $zwilias$elm_rosetree$Tree$Zipper$firstSibling(zipper);
		} else {
			var z = _v0.a;
			var $temp$zipper = z;
			zipper = $temp$zipper;
			continue root;
		}
	}
};
var $zwilias$elm_rosetree$Tree$Zipper$findFromRoot = F2(
	function (f, zipper) {
		var r = $zwilias$elm_rosetree$Tree$Zipper$root(zipper);
		return f(
			$zwilias$elm_rosetree$Tree$Zipper$label(r)) ? $elm$core$Maybe$Just(r) : A2($zwilias$elm_rosetree$Tree$Zipper$findNext, f, r);
	});
var $zwilias$elm_rosetree$Tree$foldlHelp = F4(
	function (f, acc, trees, nextSets) {
		foldlHelp:
		while (true) {
			if (!trees.b) {
				if (nextSets.b) {
					var set = nextSets.a;
					var sets = nextSets.b;
					var $temp$f = f,
						$temp$acc = acc,
						$temp$trees = set,
						$temp$nextSets = sets;
					f = $temp$f;
					acc = $temp$acc;
					trees = $temp$trees;
					nextSets = $temp$nextSets;
					continue foldlHelp;
				} else {
					return acc;
				}
			} else {
				if (!trees.a.b.b) {
					var _v2 = trees.a;
					var d = _v2.a;
					var rest = trees.b;
					var $temp$f = f,
						$temp$acc = A2(f, d, acc),
						$temp$trees = rest,
						$temp$nextSets = nextSets;
					f = $temp$f;
					acc = $temp$acc;
					trees = $temp$trees;
					nextSets = $temp$nextSets;
					continue foldlHelp;
				} else {
					var _v3 = trees.a;
					var d = _v3.a;
					var xs = _v3.b;
					var rest = trees.b;
					var $temp$f = f,
						$temp$acc = A2(f, d, acc),
						$temp$trees = xs,
						$temp$nextSets = A2($elm$core$List$cons, rest, nextSets);
					f = $temp$f;
					acc = $temp$acc;
					trees = $temp$trees;
					nextSets = $temp$nextSets;
					continue foldlHelp;
				}
			}
		}
	});
var $zwilias$elm_rosetree$Tree$foldl = F3(
	function (f, acc, t) {
		return A4(
			$zwilias$elm_rosetree$Tree$foldlHelp,
			f,
			acc,
			_List_fromArray(
				[t]),
			_List_Nil);
	});
var $zwilias$elm_rosetree$Tree$foldr = F3(
	function (f, acc, t) {
		return A3(
			$elm$core$List$foldl,
			f,
			acc,
			A3($zwilias$elm_rosetree$Tree$foldl, $elm$core$List$cons, _List_Nil, t));
	});
var $zwilias$elm_rosetree$Tree$flatten = function (t) {
	return A3($zwilias$elm_rosetree$Tree$foldr, $elm$core$List$cons, _List_Nil, t);
};
var $zwilias$elm_rosetree$Tree$Zipper$fromTree = function (t) {
	return {o: _List_Nil, q: _List_Nil, D: _List_Nil, r: t};
};
var $elm_community$graph$Graph$isEmpty = function (graph) {
	return _Utils_eq(graph, $elm_community$graph$Graph$empty);
};
var $zwilias$elm_rosetree$Tree$Zipper$mapTree = F2(
	function (f, _v0) {
		var zipper = _v0;
		return _Utils_update(
			zipper,
			{
				r: f(zipper.r)
			});
	});
var $elm$core$List$maximum = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(
			A3($elm$core$List$foldl, $elm$core$Basics$max, x, xs));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $zwilias$elm_rosetree$Tree$prependChild = F2(
	function (c, _v0) {
		var v = _v0.a;
		var cs = _v0.b;
		return A2(
			$zwilias$elm_rosetree$Tree$Tree,
			v,
			A2($elm$core$List$cons, c, cs));
	});
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$GossipGraph$Parser$adjacencyToString = F3(
	function (agents, context, acc) {
		var toCharacter = F2(
			function (_v0, acc2) {
				var id = _v0.a;
				var kind = _v0.b;
				return function (c) {
					return _Utils_ap(
						$elm$core$String$fromChar(c),
						acc2);
				}(
					((!kind) ? $elm$core$Char$toLower : $elm$core$Char$toUpper)(
						A2(
							$elm$core$Maybe$withDefault,
							'?',
							A2(
								$elm$core$Maybe$map,
								A2(
									$elm$core$Basics$composeR,
									function ($) {
										return $.fo;
									},
									function ($) {
										return $.cY;
									}),
								A2(
									$author$project$Utils$List$find,
									function (node) {
										return _Utils_eq(node.fo.b1, id);
									},
									agents)))));
			});
		var relations = A2(
			$elm$core$List$sortBy,
			$elm$core$Tuple$first,
			A2(
				$elm$core$List$map,
				function (r) {
					return _Utils_Tuple2(r.aV, r.d8);
				},
				$author$project$GossipGraph$Relation$fromNodeContext(context)));
		return A2(
			$elm$core$List$cons,
			A3($elm$core$List$foldr, toCharacter, '', relations),
			acc);
	});
var $elm_community$graph$Graph$nodes = A2(
	$elm$core$Basics$composeR,
	$elm_community$graph$Graph$unGraph,
	A2(
		$elm$core$Basics$composeR,
		$elm_community$intdict$IntDict$values,
		$elm$core$List$map(
			function ($) {
				return $.ej;
			})));
var $author$project$GossipGraph$Parser$toString = function (graph) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Basics$append,
		'',
		A2(
			$elm$core$List$intersperse,
			' ',
			$elm$core$List$reverse(
				A3(
					$elm_community$graph$Graph$fold,
					$author$project$GossipGraph$Parser$adjacencyToString(
						$elm_community$graph$Graph$nodes(graph)),
					_List_Nil,
					graph))));
};
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $zwilias$elm_rosetree$Tree$Zipper$toTree = A2($elm$core$Basics$composeL, $zwilias$elm_rosetree$Tree$Zipper$tree, $zwilias$elm_rosetree$Tree$Zipper$root);
var $author$project$Main$executeCall = F2(
	function (model, call) {
		var _v0 = model.t;
		if (!_v0.$) {
			var graph = _v0.a;
			var highestIndex = A2(
				$elm$core$Maybe$withDefault,
				0,
				$elm$core$List$maximum(
					A2(
						$elm$core$List$map,
						function (n) {
							switch (n.$) {
								case 0:
									return 0;
								case 1:
									var index = n.a.fl;
									return index;
								default:
									return -1;
							}
						},
						$zwilias$elm_rosetree$Tree$flatten(model.w))));
			var newGraph = function (_v2) {
				var callHistory = _v2.aA;
				var state = _v2.eH;
				var index = _v2.fl;
				return {
					aA: function (z) {
						return A2(
							$elm$core$Maybe$withDefault,
							callHistory,
							$zwilias$elm_rosetree$Tree$Zipper$firstChild(z));
					}(
						A2(
							$zwilias$elm_rosetree$Tree$Zipper$mapTree,
							$zwilias$elm_rosetree$Tree$prependChild(
								$zwilias$elm_rosetree$Tree$singleton(
									$author$project$GossipProtocol$GossipProtocol$Node(
										{
											e$: call,
											fl: index + 1,
											eH: A2($author$project$GossipGraph$Call$execute, state, call)
										}))),
							callHistory)),
					fl: index + 1,
					eH: A2($author$project$GossipGraph$Call$execute, state, call)
				};
			}(
				{
					aA: A2(
						$elm$core$Maybe$withDefault,
						$zwilias$elm_rosetree$Tree$Zipper$fromTree(model.w),
						A2(
							$zwilias$elm_rosetree$Tree$Zipper$findFromRoot,
							function (node) {
								if (node.$ === 1) {
									var index = node.a.fl;
									return _Utils_eq(index, model.ah);
								} else {
									return false;
								}
							},
							$zwilias$elm_rosetree$Tree$Zipper$fromTree(model.w))),
					fl: highestIndex,
					eH: graph
				});
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{
						ao: $elm$core$Result$Ok(_List_Nil),
						t: $elm$core$Result$Ok(newGraph.eH),
						w: $zwilias$elm_rosetree$Tree$Zipper$toTree(newGraph.aA),
						J: $elm_community$graph$Graph$isEmpty(model.J) ? A2($elm$core$Result$withDefault, $elm_community$graph$Graph$empty, model.t) : model.J,
						ah: newGraph.fl,
						ai: '',
						aa: $author$project$GossipGraph$Parser$toString(newGraph.eH),
						bD: $elm$core$Result$Ok(
							A3(
								$elm_community$graph$Graph$fold,
								F2(
									function (ctx, acc) {
										return _Utils_ap(
											acc,
											$author$project$GossipGraph$Relation$fromNodeContext(ctx));
									}),
								_List_Nil,
								newGraph.eH))
					}),
				$elm$core$Platform$Cmd$none);
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$executeCallSequence = function (model) {
	var _v0 = _Utils_Tuple2(model.t, model.ao);
	if ((!_v0.a.$) && (!_v0.b.$)) {
		var graph = _v0.a.a;
		var sequence = _v0.b.a;
		var highestIndex = A2(
			$elm$core$Maybe$withDefault,
			0,
			$elm$core$List$maximum(
				A2(
					$elm$core$List$map,
					function (n) {
						switch (n.$) {
							case 0:
								return 0;
							case 1:
								var index = n.a.fl;
								return index;
							default:
								return -1;
						}
					},
					$zwilias$elm_rosetree$Tree$flatten(model.w))));
		var newGraph = A3(
			$elm$core$List$foldr,
			F2(
				function (call, _v1) {
					var callHistory = _v1.aA;
					var state = _v1.eH;
					var index = _v1.fl;
					return {
						aA: function (z) {
							return A2(
								$elm$core$Maybe$withDefault,
								callHistory,
								$zwilias$elm_rosetree$Tree$Zipper$firstChild(z));
						}(
							A2(
								$zwilias$elm_rosetree$Tree$Zipper$mapTree,
								$zwilias$elm_rosetree$Tree$prependChild(
									$zwilias$elm_rosetree$Tree$singleton(
										$author$project$GossipProtocol$GossipProtocol$Node(
											{
												e$: call,
												fl: index + 1,
												eH: A2($author$project$GossipGraph$Call$execute, state, call)
											}))),
								callHistory)),
						fl: index + 1,
						eH: A2($author$project$GossipGraph$Call$execute, state, call)
					};
				}),
			{
				aA: A2(
					$elm$core$Maybe$withDefault,
					$zwilias$elm_rosetree$Tree$Zipper$fromTree(model.w),
					A2(
						$zwilias$elm_rosetree$Tree$Zipper$findFromRoot,
						function (node) {
							if (node.$ === 1) {
								var index = node.a.fl;
								return _Utils_eq(index, model.ah);
							} else {
								return false;
							}
						},
						$zwilias$elm_rosetree$Tree$Zipper$fromTree(model.w))),
				fl: highestIndex,
				eH: graph
			},
			sequence);
		return _Utils_Tuple2(
			_Utils_update(
				model,
				{
					ao: $elm$core$Result$Ok(_List_Nil),
					t: $elm$core$Result$Ok(newGraph.eH),
					w: $zwilias$elm_rosetree$Tree$Zipper$toTree(newGraph.aA),
					J: $elm_community$graph$Graph$isEmpty(model.J) ? A2($elm$core$Result$withDefault, $elm_community$graph$Graph$empty, model.t) : model.J,
					ah: newGraph.fl,
					ai: '',
					aa: $author$project$GossipGraph$Parser$toString(newGraph.eH),
					bD: $elm$core$Result$Ok(
						A3(
							$elm_community$graph$Graph$fold,
							F2(
								function (ctx, acc) {
									return _Utils_ap(
										acc,
										$author$project$GossipGraph$Relation$fromNodeContext(ctx));
								}),
							_List_Nil,
							newGraph.eH))
				}),
			$elm$core$Platform$Cmd$none);
	} else {
		return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
	}
};
var $author$project$GossipProtocol$GossipProtocol$DeadEnd = {$: 2};
var $elm$core$Array$fromListHelp = F3(
	function (list, nodeList, nodeListSize) {
		fromListHelp:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, list);
			var jsArray = _v0.a;
			var remainingItems = _v0.b;
			if (_Utils_cmp(
				$elm$core$Elm$JsArray$length(jsArray),
				$elm$core$Array$branchFactor) < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					true,
					{B: nodeList, u: nodeListSize, x: jsArray});
			} else {
				var $temp$list = remainingItems,
					$temp$nodeList = A2(
					$elm$core$List$cons,
					$elm$core$Array$Leaf(jsArray),
					nodeList),
					$temp$nodeListSize = nodeListSize + 1;
				list = $temp$list;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue fromListHelp;
			}
		}
	});
var $elm$core$Array$fromList = function (list) {
	if (!list.b) {
		return $elm$core$Array$empty;
	} else {
		return A3($elm$core$Array$fromListHelp, list, _List_Nil, 0);
	}
};
var $zwilias$elm_rosetree$Tree$mapChildren = F2(
	function (f, _v0) {
		var v = _v0.a;
		var cs = _v0.b;
		return A2(
			$zwilias$elm_rosetree$Tree$Tree,
			v,
			f(cs));
	});
var $author$project$GossipGraph$Call$fromTuple = function (_v0) {
	var x = _v0.a;
	var y = _v0.b;
	return {ap: x, aV: y};
};
var $author$project$GossipProtocol$GossipProtocol$selectCalls = F3(
	function (graph, condition, sequence) {
		var calls = F2(
			function (context, acc) {
				var localRelations = A2(
					$elm$core$List$filter,
					function (_v0) {
						var from = _v0.ap;
						var to = _v0.aV;
						return !_Utils_eq(from, to);
					},
					$author$project$GossipGraph$Relation$fromNodeContext(context));
				var relationPairs = A2(
					$elm$core$List$map,
					function (r) {
						return _Utils_Tuple2(r.ap, r.aV);
					},
					localRelations);
				return _Utils_ap(
					acc,
					A2(
						$elm$core$List$map,
						$author$project$GossipGraph$Call$fromTuple,
						A2(
							$elm$core$List$filter,
							function (x) {
								return A3(condition, x, localRelations, sequence);
							},
							relationPairs)));
			});
		return A3($elm_community$graph$Graph$fold, calls, _List_Nil, graph);
	});
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $elm$core$Array$toIndexedList = function (array) {
	var len = array.a;
	var helper = F2(
		function (entry, _v0) {
			var index = _v0.a;
			var list = _v0.b;
			return _Utils_Tuple2(
				index - 1,
				A2(
					$elm$core$List$cons,
					_Utils_Tuple2(index, entry),
					list));
		});
	return A3(
		$elm$core$Array$foldr,
		helper,
		_Utils_Tuple2(len - 1, _List_Nil),
		array).b;
};
var $author$project$GossipProtocol$GossipProtocol$generateExecutionTree = F6(
	function (index, graph, condition, sequence, depth, state) {
		var possibleCalls = $elm$core$Array$toIndexedList(
			$elm$core$Array$fromList(
				A3($author$project$GossipProtocol$GossipProtocol$selectCalls, graph, condition, sequence)));
		var nextState = $elm$core$List$isEmpty(possibleCalls) ? A2(
			$zwilias$elm_rosetree$Tree$prependChild,
			$zwilias$elm_rosetree$Tree$singleton($author$project$GossipProtocol$GossipProtocol$DeadEnd),
			state) : A3(
			$elm$core$List$foldr,
			F2(
				function (_v1, acc) {
					var ind = _v1.a;
					var call = _v1.b;
					return A2(
						$zwilias$elm_rosetree$Tree$prependChild,
						$zwilias$elm_rosetree$Tree$singleton(
							$author$project$GossipProtocol$GossipProtocol$Node(
								{
									e$: call,
									fl: index + ind,
									eH: A2($author$project$GossipGraph$Call$execute, graph, call)
								})),
						acc);
				}),
			state,
			possibleCalls);
		var nextIndex = index + $elm$core$List$length(possibleCalls);
		return (depth > 1) ? A2(
			$zwilias$elm_rosetree$Tree$mapChildren,
			$elm$core$List$indexedMap(
				F2(
					function (ind, child) {
						var _v0 = $zwilias$elm_rosetree$Tree$label(child);
						if (_v0.$ === 1) {
							var n = _v0.a;
							return A6($author$project$GossipProtocol$GossipProtocol$generateExecutionTree, nextIndex * (ind + 1), n.eH, condition, sequence, depth - 1, child);
						} else {
							return child;
						}
					})),
			nextState) : nextState;
	});
var $author$project$Main$generateExecutionTree = function (model) {
	var initialGraph = $elm_community$graph$Graph$isEmpty(model.J) ? A2($elm$core$Result$withDefault, $elm_community$graph$Graph$empty, model.t) : model.J;
	return _Utils_Tuple2(
		_Utils_update(
			model,
			{
				w: A6(
					$author$project$GossipProtocol$GossipProtocol$generateExecutionTree,
					1,
					initialGraph,
					model.aT,
					_List_Nil,
					model.bu,
					$zwilias$elm_rosetree$Tree$singleton($author$project$GossipProtocol$GossipProtocol$Root)),
				J: initialGraph,
				U: function (md) {
					return _Utils_update(
						md,
						{bk: false});
				}(model.U)
			}),
		$elm$core$Platform$Cmd$none);
};
var $author$project$Main$timeTravel = F2(
	function (to, model) {
		var targetNode = (!to) ? $elm$core$Maybe$Just(
			$zwilias$elm_rosetree$Tree$Zipper$root(
				$zwilias$elm_rosetree$Tree$Zipper$fromTree(model.w))) : A2(
			$zwilias$elm_rosetree$Tree$Zipper$findFromRoot,
			function (zip) {
				if (zip.$ === 1) {
					var index = zip.a.fl;
					return _Utils_eq(index, to);
				} else {
					return false;
				}
			},
			$zwilias$elm_rosetree$Tree$Zipper$fromTree(model.w));
		if (!targetNode.$) {
			var zip = targetNode.a;
			var node = $zwilias$elm_rosetree$Tree$Zipper$label(zip);
			switch (node.$) {
				case 1:
					var n = node.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								t: $elm$core$Result$Ok(n.eH),
								ah: to,
								aa: $author$project$GossipGraph$Parser$toString(n.eH)
							}),
						$elm$core$Platform$Cmd$none);
				case 0:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								t: $elm$core$Result$Ok(model.J),
								ah: to,
								aa: $author$project$GossipGraph$Parser$toString(model.J)
							}),
						$elm$core$Platform$Cmd$none);
				default:
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
			}
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$insertExampleGraph = F2(
	function (graph, model) {
		return function (_v1) {
			var mo = _v1.a;
			var me = _v1.b;
			return _Utils_Tuple2(
				_Utils_update(
					mo,
					{
						U: function (md) {
							return _Utils_update(
								md,
								{bk: false});
						}(mo.U)
					}),
				me);
		}(
			A2(
				$author$project$Main$update,
				$author$project$Main$ChangeGossipGraph(graph),
				model));
	});
var $author$project$Main$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				var input = msg.a;
				return A2($author$project$Main$changeGossipGraph, input, model);
			case 1:
				var input = msg.a;
				return A2($author$project$Main$changeCallSequence, model, input);
			case 3:
				var call = msg.a;
				return A2($author$project$Main$executeCall, model, call);
			case 4:
				return $author$project$Main$executeCallSequence(model);
			case 2:
				var protocolName = msg.a;
				return A2($author$project$Main$changeProtocol, protocolName, model);
			case 5:
				var to = msg.a;
				return A2($author$project$Main$timeTravel, to, model);
			case 6:
				var graph = msg.a;
				return A2($author$project$Main$insertExampleGraph, graph, model);
			case 8:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							U: function (md) {
								return _Utils_update(
									md,
									{bk: false});
							}(model.U)
						}),
					$elm$core$Platform$Cmd$none);
			case 7:
				var title = msg.a;
				var content = msg.b;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							U: {cr: content, cd: title, bk: true}
						}),
					$elm$core$Platform$Cmd$none);
			case 9:
				var depth = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							bu: A3(
								$elm$core$Basics$clamp,
								0,
								5,
								A2(
									$elm$core$Maybe$withDefault,
									5,
									$elm$core$String$toInt(depth)))
						}),
					$elm$core$Platform$Cmd$none);
			default:
				return $author$project$Main$generateExecutionTree(model);
		}
	});
var $author$project$Main$ChangeCallSequence = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$ExecuteCallSequence = {$: 4};
var $author$project$Main$ShowModal = F2(
	function (a, b) {
		return {$: 7, a: a, b: b};
	});
var $elm$html$Html$button = _VirtualDom_node('button');
var $lattyware$elm_fontawesome$FontAwesome$Icon$Icon = F5(
	function (prefix, name, width, height, paths) {
		return {dY: height, cY: name, fA: paths, i: prefix, eT: width};
	});
var $lattyware$elm_fontawesome$FontAwesome$Solid$check = A5(
	$lattyware$elm_fontawesome$FontAwesome$Icon$Icon,
	'fas',
	'check',
	512,
	512,
	_List_fromArray(
		['M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z']));
var $elm$html$Html$code = _VirtualDom_node('code');
var $elm$html$Html$p = _VirtualDom_node('p');
var $elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var $elm$html$Html$Attributes$style = $elm$virtual_dom$VirtualDom$style;
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $lattyware$elm_fontawesome$FontAwesome$Solid$times = A5(
	$lattyware$elm_fontawesome$FontAwesome$Icon$Icon,
	'fas',
	'times',
	352,
	512,
	_List_fromArray(
		['M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z']));
var $lattyware$elm_fontawesome$FontAwesome$Icon$Presentation = $elm$core$Basics$identity;
var $lattyware$elm_fontawesome$FontAwesome$Icon$present = function (icon) {
	return {bU: _List_Nil, d0: icon, b1: $elm$core$Maybe$Nothing, bB: $elm$core$Maybe$Nothing, di: 'img', cd: $elm$core$Maybe$Nothing, cg: _List_Nil};
};
var $lattyware$elm_fontawesome$FontAwesome$Icon$styled = F2(
	function (attributes, _v0) {
		var presentation = _v0;
		return _Utils_update(
			presentation,
			{
				bU: _Utils_ap(presentation.bU, attributes)
			});
	});
var $elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var $elm$html$Html$Attributes$attribute = $elm$virtual_dom$VirtualDom$attribute;
var $elm$svg$Svg$Attributes$class = _VirtualDom_attribute('class');
var $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$add = F2(
	function (transform, combined) {
		switch (transform.$) {
			case 0:
				var direction = transform.a;
				var amount = function () {
					if (!direction.$) {
						var by = direction.a;
						return by;
					} else {
						var by = direction.a;
						return -by;
					}
				}();
				return _Utils_update(
					combined,
					{dl: combined.dl + amount});
			case 1:
				var direction = transform.a;
				var _v2 = function () {
					switch (direction.$) {
						case 0:
							var by = direction.a;
							return _Utils_Tuple2(0, -by);
						case 1:
							var by = direction.a;
							return _Utils_Tuple2(0, by);
						case 2:
							var by = direction.a;
							return _Utils_Tuple2(-by, 0);
						default:
							var by = direction.a;
							return _Utils_Tuple2(by, 0);
					}
				}();
				var x = _v2.a;
				var y = _v2.b;
				return _Utils_update(
					combined,
					{Y: combined.Y + x, Z: combined.Z + y});
			case 2:
				var rotation = transform.a;
				return _Utils_update(
					combined,
					{fF: combined.fF + rotation});
			default:
				if (!transform.a) {
					var _v4 = transform.a;
					return _Utils_update(
						combined,
						{ff: true});
				} else {
					var _v5 = transform.a;
					return _Utils_update(
						combined,
						{fg: true});
				}
		}
	});
var $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$baseSize = 16;
var $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$meaninglessTransform = {ff: false, fg: false, fF: 0, dl: $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$baseSize, Y: 0, Z: 0};
var $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$combine = function (transforms) {
	return A3($elm$core$List$foldl, $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$add, $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$meaninglessTransform, transforms);
};
var $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$meaningfulTransform = function (transforms) {
	var combined = $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$combine(transforms);
	return _Utils_eq(combined, $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$meaninglessTransform) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(combined);
};
var $elm$svg$Svg$trustedNode = _VirtualDom_nodeNS('http://www.w3.org/2000/svg');
var $elm$svg$Svg$svg = $elm$svg$Svg$trustedNode('svg');
var $elm$svg$Svg$Attributes$id = _VirtualDom_attribute('id');
var $elm$svg$Svg$text = $elm$virtual_dom$VirtualDom$text;
var $elm$svg$Svg$title = $elm$svg$Svg$trustedNode('title');
var $lattyware$elm_fontawesome$FontAwesome$Icon$titledContents = F3(
	function (titleId, contents, title) {
		return A2(
			$elm$core$List$cons,
			A2(
				$elm$svg$Svg$title,
				_List_fromArray(
					[
						$elm$svg$Svg$Attributes$id(titleId)
					]),
				_List_fromArray(
					[
						$elm$svg$Svg$text(title)
					])),
			contents);
	});
var $elm$core$String$fromFloat = _String_fromNumber;
var $elm$svg$Svg$Attributes$transform = _VirtualDom_attribute('transform');
var $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$transformForSvg = F3(
	function (containerWidth, iconWidth, transform) {
		var path = 'translate(' + ($elm$core$String$fromFloat((iconWidth / 2) * (-1)) + ' -256)');
		var outer = 'translate(' + ($elm$core$String$fromFloat(containerWidth / 2) + ' 256)');
		var innerTranslate = 'translate(' + ($elm$core$String$fromFloat(transform.Y * 32) + (',' + ($elm$core$String$fromFloat(transform.Z * 32) + ') ')));
		var innerRotate = 'rotate(' + ($elm$core$String$fromFloat(transform.fF) + ' 0 0)');
		var flipY = transform.fg ? (-1) : 1;
		var scaleY = (transform.dl / $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$baseSize) * flipY;
		var flipX = transform.ff ? (-1) : 1;
		var scaleX = (transform.dl / $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$baseSize) * flipX;
		var innerScale = 'scale(' + ($elm$core$String$fromFloat(scaleX) + (', ' + ($elm$core$String$fromFloat(scaleY) + ') ')));
		return {
			d2: $elm$svg$Svg$Attributes$transform(
				_Utils_ap(
					innerTranslate,
					_Utils_ap(innerScale, innerRotate))),
			bB: $elm$svg$Svg$Attributes$transform(outer),
			eo: $elm$svg$Svg$Attributes$transform(path)
		};
	});
var $elm$svg$Svg$Attributes$viewBox = _VirtualDom_attribute('viewBox');
var $elm$svg$Svg$Attributes$height = _VirtualDom_attribute('height');
var $elm$svg$Svg$Attributes$width = _VirtualDom_attribute('width');
var $elm$svg$Svg$Attributes$x = _VirtualDom_attribute('x');
var $elm$svg$Svg$Attributes$y = _VirtualDom_attribute('y');
var $lattyware$elm_fontawesome$FontAwesome$Icon$allSpace = _List_fromArray(
	[
		$elm$svg$Svg$Attributes$x('0'),
		$elm$svg$Svg$Attributes$y('0'),
		$elm$svg$Svg$Attributes$width('100%'),
		$elm$svg$Svg$Attributes$height('100%')
	]);
var $elm$svg$Svg$clipPath = $elm$svg$Svg$trustedNode('clipPath');
var $elm$svg$Svg$Attributes$clipPath = _VirtualDom_attribute('clip-path');
var $elm$svg$Svg$Attributes$d = _VirtualDom_attribute('d');
var $elm$svg$Svg$Attributes$fill = _VirtualDom_attribute('fill');
var $elm$svg$Svg$path = $elm$svg$Svg$trustedNode('path');
var $lattyware$elm_fontawesome$FontAwesome$Svg$Internal$corePath = F2(
	function (attrs, d) {
		return A2(
			$elm$svg$Svg$path,
			A2(
				$elm$core$List$cons,
				$elm$svg$Svg$Attributes$fill('currentColor'),
				A2(
					$elm$core$List$cons,
					$elm$svg$Svg$Attributes$d(d),
					attrs)),
			_List_Nil);
	});
var $elm$svg$Svg$g = $elm$svg$Svg$trustedNode('g');
var $lattyware$elm_fontawesome$FontAwesome$Svg$Internal$corePaths = F2(
	function (attrs, icon) {
		var _v0 = icon.fA;
		if (!_v0.b) {
			return A2($lattyware$elm_fontawesome$FontAwesome$Svg$Internal$corePath, attrs, '');
		} else {
			if (!_v0.b.b) {
				var only = _v0.a;
				return A2($lattyware$elm_fontawesome$FontAwesome$Svg$Internal$corePath, attrs, only);
			} else {
				var secondary = _v0.a;
				var _v1 = _v0.b;
				var primary = _v1.a;
				return A2(
					$elm$svg$Svg$g,
					_List_fromArray(
						[
							$elm$svg$Svg$Attributes$class('fa-group')
						]),
					_List_fromArray(
						[
							A2(
							$lattyware$elm_fontawesome$FontAwesome$Svg$Internal$corePath,
							A2(
								$elm$core$List$cons,
								$elm$svg$Svg$Attributes$class('fa-secondary'),
								attrs),
							secondary),
							A2(
							$lattyware$elm_fontawesome$FontAwesome$Svg$Internal$corePath,
							A2(
								$elm$core$List$cons,
								$elm$svg$Svg$Attributes$class('fa-primary'),
								attrs),
							primary)
						]));
			}
		}
	});
var $elm$svg$Svg$defs = $elm$svg$Svg$trustedNode('defs');
var $elm$svg$Svg$mask = $elm$svg$Svg$trustedNode('mask');
var $elm$svg$Svg$Attributes$mask = _VirtualDom_attribute('mask');
var $elm$svg$Svg$Attributes$maskContentUnits = _VirtualDom_attribute('maskContentUnits');
var $elm$svg$Svg$Attributes$maskUnits = _VirtualDom_attribute('maskUnits');
var $elm$svg$Svg$rect = $elm$svg$Svg$trustedNode('rect');
var $lattyware$elm_fontawesome$FontAwesome$Icon$viewMaskedWithTransform = F4(
	function (id, transforms, inner, outer) {
		var maskInnerGroup = A2(
			$elm$svg$Svg$g,
			_List_fromArray(
				[transforms.d2]),
			_List_fromArray(
				[
					A2(
					$lattyware$elm_fontawesome$FontAwesome$Svg$Internal$corePaths,
					_List_fromArray(
						[
							$elm$svg$Svg$Attributes$fill('black'),
							transforms.eo
						]),
					inner)
				]));
		var maskId = 'mask-' + (inner.cY + ('-' + id));
		var maskTag = A2(
			$elm$svg$Svg$mask,
			_Utils_ap(
				_List_fromArray(
					[
						$elm$svg$Svg$Attributes$id(maskId),
						$elm$svg$Svg$Attributes$maskUnits('userSpaceOnUse'),
						$elm$svg$Svg$Attributes$maskContentUnits('userSpaceOnUse')
					]),
				$lattyware$elm_fontawesome$FontAwesome$Icon$allSpace),
			_List_fromArray(
				[
					A2(
					$elm$svg$Svg$rect,
					A2(
						$elm$core$List$cons,
						$elm$svg$Svg$Attributes$fill('white'),
						$lattyware$elm_fontawesome$FontAwesome$Icon$allSpace),
					_List_Nil),
					A2(
					$elm$svg$Svg$g,
					_List_fromArray(
						[transforms.bB]),
					_List_fromArray(
						[maskInnerGroup]))
				]));
		var clipId = 'clip-' + (outer.cY + ('-' + id));
		var defs = A2(
			$elm$svg$Svg$defs,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$svg$Svg$clipPath,
					_List_fromArray(
						[
							$elm$svg$Svg$Attributes$id(clipId)
						]),
					_List_fromArray(
						[
							A2($lattyware$elm_fontawesome$FontAwesome$Svg$Internal$corePaths, _List_Nil, outer)
						])),
					maskTag
				]));
		return _List_fromArray(
			[
				defs,
				A2(
				$elm$svg$Svg$rect,
				$elm$core$List$concat(
					_List_fromArray(
						[
							_List_fromArray(
							[
								$elm$svg$Svg$Attributes$fill('currentColor'),
								$elm$svg$Svg$Attributes$clipPath('url(#' + (clipId + ')')),
								$elm$svg$Svg$Attributes$mask('url(#' + (maskId + ')'))
							]),
							$lattyware$elm_fontawesome$FontAwesome$Icon$allSpace
						])),
				_List_Nil)
			]);
	});
var $lattyware$elm_fontawesome$FontAwesome$Icon$viewWithTransform = F2(
	function (transforms, icon) {
		if (!transforms.$) {
			var ts = transforms.a;
			return A2(
				$elm$svg$Svg$g,
				_List_fromArray(
					[ts.bB]),
				_List_fromArray(
					[
						A2(
						$elm$svg$Svg$g,
						_List_fromArray(
							[ts.d2]),
						_List_fromArray(
							[
								A2(
								$lattyware$elm_fontawesome$FontAwesome$Svg$Internal$corePaths,
								_List_fromArray(
									[ts.eo]),
								icon)
							]))
					]));
		} else {
			return A2($lattyware$elm_fontawesome$FontAwesome$Svg$Internal$corePaths, _List_Nil, icon);
		}
	});
var $lattyware$elm_fontawesome$FontAwesome$Icon$internalView = function (_v0) {
	var icon = _v0.d0;
	var attributes = _v0.bU;
	var transforms = _v0.cg;
	var role = _v0.di;
	var id = _v0.b1;
	var title = _v0.cd;
	var outer = _v0.bB;
	var alwaysId = A2($elm$core$Maybe$withDefault, icon.cY, id);
	var titleId = alwaysId + '-title';
	var semantics = A2(
		$elm$core$Maybe$withDefault,
		A2($elm$html$Html$Attributes$attribute, 'aria-hidden', 'true'),
		A2(
			$elm$core$Maybe$map,
			$elm$core$Basics$always(
				A2($elm$html$Html$Attributes$attribute, 'aria-labelledby', titleId)),
			title));
	var _v1 = A2(
		$elm$core$Maybe$withDefault,
		_Utils_Tuple2(icon.eT, icon.dY),
		A2(
			$elm$core$Maybe$map,
			function (o) {
				return _Utils_Tuple2(o.eT, o.dY);
			},
			outer));
	var width = _v1.a;
	var height = _v1.b;
	var classes = _List_fromArray(
		[
			'svg-inline--fa',
			'fa-' + icon.cY,
			'fa-w-' + $elm$core$String$fromInt(
			$elm$core$Basics$ceiling((width / height) * 16))
		]);
	var svgTransform = A2(
		$elm$core$Maybe$map,
		A2($lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$transformForSvg, width, icon.eT),
		$lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$meaningfulTransform(transforms));
	var contents = function () {
		var resolvedSvgTransform = A2(
			$elm$core$Maybe$withDefault,
			A3($lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$transformForSvg, width, icon.eT, $lattyware$elm_fontawesome$FontAwesome$Transforms$Internal$meaninglessTransform),
			svgTransform);
		return A2(
			$elm$core$Maybe$withDefault,
			_List_fromArray(
				[
					A2($lattyware$elm_fontawesome$FontAwesome$Icon$viewWithTransform, svgTransform, icon)
				]),
			A2(
				$elm$core$Maybe$map,
				A3($lattyware$elm_fontawesome$FontAwesome$Icon$viewMaskedWithTransform, alwaysId, resolvedSvgTransform, icon),
				outer));
	}();
	var potentiallyTitledContents = A2(
		$elm$core$Maybe$withDefault,
		contents,
		A2(
			$elm$core$Maybe$map,
			A2($lattyware$elm_fontawesome$FontAwesome$Icon$titledContents, titleId, contents),
			title));
	return A2(
		$elm$svg$Svg$svg,
		$elm$core$List$concat(
			_List_fromArray(
				[
					_List_fromArray(
					[
						A2($elm$html$Html$Attributes$attribute, 'role', role),
						A2($elm$html$Html$Attributes$attribute, 'xmlns', 'http://www.w3.org/2000/svg'),
						$elm$svg$Svg$Attributes$viewBox(
						'0 0 ' + ($elm$core$String$fromInt(width) + (' ' + $elm$core$String$fromInt(height)))),
						semantics
					]),
					A2($elm$core$List$map, $elm$svg$Svg$Attributes$class, classes),
					attributes
				])),
		potentiallyTitledContents);
};
var $lattyware$elm_fontawesome$FontAwesome$Icon$view = function (presentation) {
	return $lattyware$elm_fontawesome$FontAwesome$Icon$internalView(presentation);
};
var $lattyware$elm_fontawesome$FontAwesome$Icon$viewStyled = function (styles) {
	return A2(
		$elm$core$Basics$composeR,
		$lattyware$elm_fontawesome$FontAwesome$Icon$present,
		A2(
			$elm$core$Basics$composeR,
			$lattyware$elm_fontawesome$FontAwesome$Icon$styled(styles),
			$lattyware$elm_fontawesome$FontAwesome$Icon$view));
};
var $author$project$Main$callSequenceHelpView = _List_fromArray(
	[
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('This input allows you to enter a call sequence and see if it is allowed under the current protocol. \n            The input has to look like '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('ab;cd')
					])),
				$elm$html$Html$text('. This represents two calls: One from agent '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('A')
					])),
				$elm$html$Html$text(' to agent '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('B')
					])),
				$elm$html$Html$text(', and one from agent '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('C')
					])),
				$elm$html$Html$text(' to agent '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('D')
					])),
				$elm$html$Html$text('. You can use semicolons ('),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text(';')
					])),
				$elm$html$Html$text('), commas ('),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text(',')
					])),
				$elm$html$Html$text(') or spaces '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('⎵')
					])),
				$elm$html$Html$text(' as separators between calls.')
			])),
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('Once you have entered a sequence, a symbol ('),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$lattyware$elm_fontawesome$FontAwesome$Icon$viewStyled,
						_List_fromArray(
							[
								A2($elm$html$Html$Attributes$style, 'color', 'red')
							]),
						$lattyware$elm_fontawesome$FontAwesome$Solid$times)
					])),
				$elm$html$Html$text(' or '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$lattyware$elm_fontawesome$FontAwesome$Icon$viewStyled,
						_List_fromArray(
							[
								A2($elm$html$Html$Attributes$style, 'color', 'green')
							]),
						$lattyware$elm_fontawesome$FontAwesome$Solid$check)
					])),
				$elm$html$Html$text(') represents whether the call sequence is permissible. '),
				$elm$html$Html$text('If the sequence is permissible, you can click the '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('Execute')
					])),
				$elm$html$Html$text(' button to execute the call sequence on the gossip graph. \n            The list of calls will then be made, and the graph will be changed accordingly,\n            and the call sequence will be added to the call history.')
			]))
	]);
var $elm$html$Html$strong = _VirtualDom_node('strong');
var $author$project$Main$callSequencePermissibilityHelpView = F2(
	function (protocolName, permitted) {
		return _List_fromArray(
			[
				A2(
				$elm$html$Html$p,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text(
						'The current call sequence is ' + (((!permitted) ? 'not' : '') + ' permitted under the ')),
						A2(
						$elm$html$Html$code,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text(protocolName)
							])),
						$elm$html$Html$text(' protocol.')
					])),
				A2(
				$elm$html$Html$p,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('You can see which calls are possible from the current graph in the '),
						A2(
						$elm$html$Html$strong,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Gossip Protocols')
							])),
						$elm$html$Html$text(' section.')
					]))
			]);
	});
var $elm$json$Json$Encode$string = _Json_wrap;
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$disabled = $elm$html$Html$Attributes$boolProperty('disabled');
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$html$Html$h2 = _VirtualDom_node('h2');
var $elm$html$Html$header = _VirtualDom_node('header');
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $lattyware$elm_fontawesome$FontAwesome$Solid$question = A5(
	$lattyware$elm_fontawesome$FontAwesome$Icon$Icon,
	'fas',
	'question',
	384,
	512,
	_List_fromArray(
		['M202.021 0C122.202 0 70.503 32.703 29.914 91.026c-7.363 10.58-5.093 25.086 5.178 32.874l43.138 32.709c10.373 7.865 25.132 6.026 33.253-4.148 25.049-31.381 43.63-49.449 82.757-49.449 30.764 0 68.816 19.799 68.816 49.631 0 22.552-18.617 34.134-48.993 51.164-35.423 19.86-82.299 44.576-82.299 106.405V320c0 13.255 10.745 24 24 24h72.471c13.255 0 24-10.745 24-24v-5.773c0-42.86 125.268-44.645 125.268-160.627C377.504 66.256 286.902 0 202.021 0zM192 373.459c-38.196 0-69.271 31.075-69.271 69.271 0 38.195 31.075 69.27 69.271 69.27s69.271-31.075 69.271-69.271-31.075-69.27-69.271-69.27z']));
var $lattyware$elm_fontawesome$FontAwesome$Icon$viewIcon = A2($elm$core$Basics$composeR, $lattyware$elm_fontawesome$FontAwesome$Icon$present, $lattyware$elm_fontawesome$FontAwesome$Icon$view);
var $author$project$Main$helpButtonView = F2(
	function (title, content) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('help'),
					$elm$html$Html$Events$onClick(
					A2($author$project$Main$ShowModal, title, content))
				]),
			_List_fromArray(
				[
					$lattyware$elm_fontawesome$FontAwesome$Icon$viewIcon($lattyware$elm_fontawesome$FontAwesome$Solid$question)
				]));
	});
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $elm$html$Html$input = _VirtualDom_node('input');
var $author$project$GossipProtocol$Conditions$Predefined$name = $elm$core$Dict$fromList(
	_List_fromArray(
		[
			_Utils_Tuple2('any', 'Any'),
			_Utils_Tuple2('tok', 'Token'),
			_Utils_Tuple2('spi', 'Spider'),
			_Utils_Tuple2('co', 'Call Once'),
			_Utils_Tuple2('wco', 'Weak Call Once'),
			_Utils_Tuple2('lns', 'Learn New Secrets')
		]));
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$json$Json$Decode$string = _Json_decodeString;
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $author$project$Utils$Alert$Error = 2;
var $author$project$Utils$Alert$Warning = 1;
var $author$project$GossipGraph$Agent$fromId = F2(
	function (agents, id) {
		return A2(
			$elm$core$Result$fromMaybe,
			'An agent with id' + ($elm$core$String$fromInt(id) + ' does not exist.'),
			A2(
				$author$project$Utils$List$find,
				function (agent) {
					return _Utils_eq(agent.b1, id);
				},
				agents));
	});
var $author$project$GossipGraph$Call$render = F2(
	function (agents, call) {
		var _v0 = _Utils_Tuple2(
			A2($author$project$GossipGraph$Agent$fromId, agents, call.ap),
			A2($author$project$GossipGraph$Agent$fromId, agents, call.aV));
		if ((!_v0.a.$) && (!_v0.b.$)) {
			var from = _v0.a.a;
			var to = _v0.b.a;
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('call')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						$elm$core$String$fromChar(from.cY) + (' 📞 ' + $elm$core$String$fromChar(to.cY)))
					]));
		} else {
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('call')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('❌')
					]));
		}
	});
var $author$project$Utils$Alert$cls = function (type_) {
	switch (type_) {
		case 0:
			return 'info';
		case 1:
			return 'warning';
		default:
			return 'error';
	}
};
var $lattyware$elm_fontawesome$FontAwesome$Solid$exclamationCircle = A5(
	$lattyware$elm_fontawesome$FontAwesome$Icon$Icon,
	'fas',
	'exclamation-circle',
	512,
	512,
	_List_fromArray(
		['M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zm-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z']));
var $lattyware$elm_fontawesome$FontAwesome$Attributes$fa2x = $elm$svg$Svg$Attributes$class('fa-2x');
var $lattyware$elm_fontawesome$FontAwesome$Solid$infoCircle = A5(
	$lattyware$elm_fontawesome$FontAwesome$Icon$Icon,
	'fas',
	'info-circle',
	512,
	512,
	_List_fromArray(
		['M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z']));
var $lattyware$elm_fontawesome$FontAwesome$Solid$timesCircle = A5(
	$lattyware$elm_fontawesome$FontAwesome$Icon$Icon,
	'fas',
	'times-circle',
	512,
	512,
	_List_fromArray(
		['M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z']));
var $author$project$Utils$Alert$icn = function (type_) {
	switch (type_) {
		case 0:
			return A2(
				$lattyware$elm_fontawesome$FontAwesome$Icon$viewStyled,
				_List_fromArray(
					[$lattyware$elm_fontawesome$FontAwesome$Attributes$fa2x]),
				$lattyware$elm_fontawesome$FontAwesome$Solid$infoCircle);
		case 1:
			return A2(
				$lattyware$elm_fontawesome$FontAwesome$Icon$viewStyled,
				_List_fromArray(
					[$lattyware$elm_fontawesome$FontAwesome$Attributes$fa2x]),
				$lattyware$elm_fontawesome$FontAwesome$Solid$exclamationCircle);
		default:
			return A2(
				$lattyware$elm_fontawesome$FontAwesome$Icon$viewStyled,
				_List_fromArray(
					[$lattyware$elm_fontawesome$FontAwesome$Attributes$fa2x]),
				$lattyware$elm_fontawesome$FontAwesome$Solid$timesCircle);
	}
};
var $author$project$Utils$Alert$render = F2(
	function (type_, content) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					'alert ' + $author$project$Utils$Alert$cls(type_))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('icon')
						]),
					_List_fromArray(
						[
							$author$project$Utils$Alert$icn(type_)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('content')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(content)
						]))
				]));
	});
var $author$project$CallSequence$Renderer$render = F2(
	function (sequenceResult, agentsResult) {
		var _v0 = _Utils_Tuple2(sequenceResult, agentsResult);
		if (!_v0.a.$) {
			if (!_v0.b.$) {
				var sequence = _v0.a.a;
				var agents = _v0.b.a;
				return $elm$core$List$isEmpty(sequence) ? _List_fromArray(
					[
						$elm$html$Html$text('No call sequence entered')
					]) : A2(
					$elm$core$List$map,
					$author$project$GossipGraph$Call$render(agents),
					$elm$core$List$reverse(sequence));
			} else {
				return _List_fromArray(
					[
						A2($author$project$Utils$Alert$render, 1, ' There was a problem parsing the initial gossip graph.')
					]);
			}
		} else {
			if (!_v0.b.$) {
				var error = _v0.a.a;
				return _List_fromArray(
					[
						A2($author$project$Utils$Alert$render, 2, error)
					]);
			} else {
				var e1 = _v0.a.a;
				return _List_fromArray(
					[
						A2($author$project$Utils$Alert$render, 2, e1 + ' Additionally, there was a problem parsing the initial gossip graph.')
					]);
			}
		}
	});
var $elm$html$Html$section = _VirtualDom_node('section');
var $author$project$GossipProtocol$GossipProtocol$sequencePermittedOn = F3(
	function (condition, graph, sequence) {
		var relations = function (g) {
			return A3(
				$elm_community$graph$Graph$fold,
				F2(
					function (ctx, acc) {
						return _Utils_ap(
							acc,
							$author$project$GossipGraph$Relation$fromNodeContext(ctx));
					}),
				_List_Nil,
				g);
		};
		var isCallPermitted = F3(
			function (_v2, currentGraph, callHistory) {
				var from = _v2.ap;
				var to = _v2.aV;
				var rels = relations(currentGraph);
				return (!_Utils_eq(from, to)) && (A2(
					$elm$core$List$any,
					function (r) {
						return A4($author$project$GossipGraph$Relation$knows, from, to, 0, r);
					},
					rels) && A3(
					condition,
					_Utils_Tuple2(from, to),
					rels,
					callHistory));
			});
		return function (_v1) {
			var isPermitted = _v1.c;
			return isPermitted;
		}(
			A3(
				$elm$core$List$foldr,
				F2(
					function (call, _v0) {
						var history = _v0.a;
						var state = _v0.b;
						var permitted = _v0.c;
						return _Utils_Tuple3(
							A2($elm$core$List$cons, call, history),
							A2($author$project$GossipGraph$Call$execute, state, call),
							permitted && A3(isCallPermitted, call, state, history));
					}),
				_Utils_Tuple3(_List_Nil, graph, true),
				sequence));
	});
var $elm$html$Html$Attributes$title = $elm$html$Html$Attributes$stringProperty('title');
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$Main$callSequenceView = function (model) {
	var permitted = function () {
		var _v0 = _Utils_Tuple2(model.t, model.ao);
		if ((!_v0.a.$) && (!_v0.b.$)) {
			var graph = _v0.a.a;
			var sequence = _v0.b.a;
			return A3($author$project$GossipProtocol$GossipProtocol$sequencePermittedOn, model.aT, graph, sequence);
		} else {
			return false;
		}
	}();
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$id('sequences')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$header,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h2,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Call sequence')
							])),
						A2($author$project$Main$helpButtonView, 'Call Sequences', $author$project$Main$callSequenceHelpView)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('input-group')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$id('call-sequence-input'),
								$elm$html$Html$Attributes$class(
								(permitted && (!$elm$core$String$isEmpty(model.ai))) ? 'permitted' : ($elm$core$String$isEmpty(model.ai) ? '' : 'not-permitted')),
								$elm$html$Html$Attributes$value(model.ai),
								$elm$html$Html$Events$onInput($author$project$Main$ChangeCallSequence),
								$elm$html$Html$Attributes$placeholder('Call sequence input')
							]),
						_List_Nil),
						$elm$core$String$isEmpty(model.ai) ? A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$disabled(true),
								$elm$html$Html$Attributes$class('help'),
								$elm$html$Html$Attributes$id('call-sequence-validity')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(' ')
							])) : (permitted ? A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('help permitted'),
								$elm$html$Html$Attributes$id('call-sequence-validity'),
								$elm$html$Html$Events$onClick(
								A2(
									$author$project$Main$ShowModal,
									'Call sequence permissibility',
									A2(
										$author$project$Main$callSequencePermissibilityHelpView,
										A2(
											$elm$core$Maybe$withDefault,
											'?',
											A2($elm$core$Dict$get, model.as, $author$project$GossipProtocol$Conditions$Predefined$name)),
										permitted)))
							]),
						_List_fromArray(
							[
								A2(
								$lattyware$elm_fontawesome$FontAwesome$Icon$viewStyled,
								_List_fromArray(
									[
										A2($elm$html$Html$Attributes$style, 'color', 'green')
									]),
								$lattyware$elm_fontawesome$FontAwesome$Solid$check)
							])) : A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('help not-permitted'),
								$elm$html$Html$Attributes$id('call-sequence-validity'),
								$elm$html$Html$Events$onClick(
								A2(
									$author$project$Main$ShowModal,
									'Call sequence permissibility',
									A2(
										$author$project$Main$callSequencePermissibilityHelpView,
										A2(
											$elm$core$Maybe$withDefault,
											'?',
											A2($elm$core$Dict$get, model.as, $author$project$GossipProtocol$Conditions$Predefined$name)),
										permitted)))
							]),
						_List_fromArray(
							[
								A2(
								$lattyware$elm_fontawesome$FontAwesome$Icon$viewStyled,
								_List_fromArray(
									[
										A2($elm$html$Html$Attributes$style, 'color', 'red')
									]),
								$lattyware$elm_fontawesome$FontAwesome$Solid$times)
							]))),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('button'),
								$elm$html$Html$Events$onClick($author$project$Main$ExecuteCallSequence),
								$elm$html$Html$Attributes$disabled(!permitted),
								$elm$html$Html$Attributes$title(
								permitted ? 'Execute the calls in this sequence on the gossip graph' : 'The call sequence must be permitted before it can be executed')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Execute')
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('call-list')
					]),
				A2($author$project$CallSequence$Renderer$render, model.ao, model.aL))
			]));
};
var $author$project$Utils$Alert$Information = 0;
var $author$project$Main$canonicalRepresentationInfoView = _List_fromArray(
	[
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('The '),
				A2(
				$elm$html$Html$strong,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('canonical representation')
					])),
				$elm$html$Html$text(' of the input represents the same graph as the one generated from the input string.\n            However, it has renamed all agents so the first agent is called '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('A')
					])),
				$elm$html$Html$text(', the second '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('B')
					])),
				$elm$html$Html$text(', and so on. For example, the input string '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('Xqv Qvx Vxq')
					])),
				$elm$html$Html$text(' becomes '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('Abc aBc abC')
					])),
				$elm$html$Html$text('.')
			]))
	]);
var $lattyware$elm_fontawesome$FontAwesome$Solid$chalkboard = A5(
	$lattyware$elm_fontawesome$FontAwesome$Icon$Icon,
	'fas',
	'chalkboard',
	640,
	512,
	_List_fromArray(
		['M96 64h448v352h64V40c0-22.06-17.94-40-40-40H72C49.94 0 32 17.94 32 40v376h64V64zm528 384H480v-64H288v64H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h608c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z']));
var $lattyware$elm_fontawesome$FontAwesome$Solid$dumbbell = A5(
	$lattyware$elm_fontawesome$FontAwesome$Icon$Icon,
	'fas',
	'dumbbell',
	640,
	512,
	_List_fromArray(
		['M104 96H56c-13.3 0-24 10.7-24 24v104H8c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h24v104c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24zm528 128h-24V120c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24v272c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V288h24c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM456 32h-48c-13.3 0-24 10.7-24 24v168H256V56c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24v400c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V288h128v168c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24z']));
var $lattyware$elm_fontawesome$FontAwesome$Solid$feather = A5(
	$lattyware$elm_fontawesome$FontAwesome$Icon$Icon,
	'fas',
	'feather',
	512,
	512,
	_List_fromArray(
		['M467.14 44.84c-62.55-62.48-161.67-64.78-252.28 25.73-78.61 78.52-60.98 60.92-85.75 85.66-60.46 60.39-70.39 150.83-63.64 211.17l178.44-178.25c6.26-6.25 16.4-6.25 22.65 0s6.25 16.38 0 22.63L7.04 471.03c-9.38 9.37-9.38 24.57 0 33.94 9.38 9.37 24.6 9.37 33.98 0l66.1-66.03C159.42 454.65 279 457.11 353.95 384h-98.19l147.57-49.14c49.99-49.93 36.38-36.18 46.31-46.86h-97.78l131.54-43.8c45.44-74.46 34.31-148.84-16.26-199.36z']));
var $author$project$GossipGraph$Relation$isOfKind = F2(
	function (relation, kind) {
		return _Utils_eq(relation.d8, kind) || ((relation.d8 === 1) && (!kind));
	});
var $elm_community$graph$Graph$insert = F2(
	function (nodeContext, graph) {
		return A3(
			$elm_community$graph$Graph$update,
			nodeContext.ej.b1,
			$elm$core$Basics$always(
				$elm$core$Maybe$Just(nodeContext)),
			graph);
	});
var $elm_community$graph$Graph$mapContexts = function (f) {
	return A2(
		$elm_community$graph$Graph$fold,
		function (ctx) {
			return $elm_community$graph$Graph$insert(
				f(ctx));
		},
		$elm_community$graph$Graph$empty);
};
var $elm_community$graph$Graph$AcyclicGraph = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm_community$graph$Graph$Edge = F3(
	function (from, to, label) {
		return {ap: from, fo: label, aV: to};
	});
var $elm_community$intdict$IntDict$intersect = F2(
	function (l, r) {
		intersect:
		while (true) {
			var _v0 = _Utils_Tuple2(l, r);
			_v0$1:
			while (true) {
				_v0$2:
				while (true) {
					switch (_v0.a.$) {
						case 0:
							var _v1 = _v0.a;
							return $elm_community$intdict$IntDict$Empty;
						case 1:
							switch (_v0.b.$) {
								case 0:
									break _v0$1;
								case 1:
									break _v0$2;
								default:
									break _v0$2;
							}
						default:
							switch (_v0.b.$) {
								case 0:
									break _v0$1;
								case 1:
									var lr = _v0.b.a;
									var _v3 = A2($elm_community$intdict$IntDict$get, lr.d7, l);
									if (!_v3.$) {
										var v = _v3.a;
										return A2($elm_community$intdict$IntDict$leaf, lr.d7, v);
									} else {
										return $elm_community$intdict$IntDict$Empty;
									}
								default:
									var il = _v0.a.a;
									var ir = _v0.b.a;
									var _v4 = A2($elm_community$intdict$IntDict$determineBranchRelation, il, ir);
									switch (_v4.$) {
										case 0:
											return A3(
												$elm_community$intdict$IntDict$inner,
												il.i,
												A2($elm_community$intdict$IntDict$intersect, il.d, ir.d),
												A2($elm_community$intdict$IntDict$intersect, il.e, ir.e));
										case 1:
											if (!_v4.a) {
												if (_v4.b === 1) {
													var _v5 = _v4.a;
													var _v6 = _v4.b;
													var $temp$l = il.e,
														$temp$r = r;
													l = $temp$l;
													r = $temp$r;
													continue intersect;
												} else {
													var _v9 = _v4.a;
													var _v10 = _v4.b;
													var $temp$l = il.d,
														$temp$r = r;
													l = $temp$l;
													r = $temp$r;
													continue intersect;
												}
											} else {
												if (_v4.b === 1) {
													var _v7 = _v4.a;
													var _v8 = _v4.b;
													var $temp$l = l,
														$temp$r = ir.e;
													l = $temp$l;
													r = $temp$r;
													continue intersect;
												} else {
													var _v11 = _v4.a;
													var _v12 = _v4.b;
													var $temp$l = l,
														$temp$r = ir.d;
													l = $temp$l;
													r = $temp$r;
													continue intersect;
												}
											}
										default:
											return $elm_community$intdict$IntDict$Empty;
									}
							}
					}
				}
				var ll = _v0.a.a;
				return A2($elm_community$intdict$IntDict$member, ll.d7, r) ? l : $elm_community$intdict$IntDict$Empty;
			}
			var _v2 = _v0.b;
			return $elm_community$intdict$IntDict$Empty;
		}
	});
var $elm_community$graph$Graph$unsafeGet = F3(
	function (msg, id, graph) {
		var _v0 = A2($elm_community$graph$Graph$get, id, graph);
		if (_v0.$ === 1) {
			return $elm_community$graph$Graph$crashHack(msg);
		} else {
			var ctx = _v0.a;
			return ctx;
		}
	});
var $elm_community$graph$Graph$checkForBackEdges = F2(
	function (ordering, graph) {
		var success = function (_v3) {
			return A2($elm_community$graph$Graph$AcyclicGraph, graph, ordering);
		};
		var check = F2(
			function (id, _v2) {
				var backSet = _v2.a;
				var error = 'Graph.checkForBackEdges: `ordering` didn\'t contain `id`';
				var ctx = A3($elm_community$graph$Graph$unsafeGet, error, id, graph);
				var backSetWithId = A3($elm_community$intdict$IntDict$insert, id, 0, backSet);
				var backEdges = A2($elm_community$intdict$IntDict$intersect, ctx.c2, backSetWithId);
				var _v0 = $elm_community$intdict$IntDict$findMin(backEdges);
				if (_v0.$ === 1) {
					return $elm$core$Result$Ok(
						_Utils_Tuple2(backSetWithId, 0));
				} else {
					var _v1 = _v0.a;
					var to = _v1.a;
					var label = _v1.b;
					return $elm$core$Result$Err(
						A3($elm_community$graph$Graph$Edge, id, to, label));
				}
			});
		return A2(
			$elm$core$Result$map,
			success,
			A3(
				$elm$core$List$foldl,
				F2(
					function (id, res) {
						return A2(
							$elm$core$Result$andThen,
							check(id),
							res);
					}),
				$elm$core$Result$Ok(
					_Utils_Tuple2($elm_community$intdict$IntDict$empty, 0)),
				ordering));
	});
var $elm_community$intdict$IntDict$keys = function (dict) {
	return A3(
		$elm_community$intdict$IntDict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm_community$graph$Graph$alongOutgoingEdges = function (ctx) {
	return $elm_community$intdict$IntDict$keys(ctx.c2);
};
var $elm_community$graph$Graph$guidedDfs = F5(
	function (selectNeighbors, visitNode, startingSeeds, startingAcc, startingGraph) {
		var go = F3(
			function (seeds, acc, graph) {
				go:
				while (true) {
					if (!seeds.b) {
						return _Utils_Tuple2(acc, graph);
					} else {
						var next = seeds.a;
						var seeds1 = seeds.b;
						var _v1 = A2($elm_community$graph$Graph$get, next, graph);
						if (_v1.$ === 1) {
							var $temp$seeds = seeds1,
								$temp$acc = acc,
								$temp$graph = graph;
							seeds = $temp$seeds;
							acc = $temp$acc;
							graph = $temp$graph;
							continue go;
						} else {
							var ctx = _v1.a;
							var _v2 = A2(visitNode, ctx, acc);
							var accAfterDiscovery = _v2.a;
							var finishNode = _v2.b;
							var _v3 = A3(
								go,
								selectNeighbors(ctx),
								accAfterDiscovery,
								A2($elm_community$graph$Graph$remove, next, graph));
							var accBeforeFinish = _v3.a;
							var graph1 = _v3.b;
							var accAfterFinish = finishNode(accBeforeFinish);
							var $temp$seeds = seeds1,
								$temp$acc = accAfterFinish,
								$temp$graph = graph1;
							seeds = $temp$seeds;
							acc = $temp$acc;
							graph = $temp$graph;
							continue go;
						}
					}
				}
			});
		return A3(go, startingSeeds, startingAcc, startingGraph);
	});
var $elm_community$graph$Graph$nodeIds = A2($elm$core$Basics$composeR, $elm_community$graph$Graph$unGraph, $elm_community$intdict$IntDict$keys);
var $elm_community$graph$Graph$dfs = F3(
	function (visitNode, acc, graph) {
		return A5(
			$elm_community$graph$Graph$guidedDfs,
			$elm_community$graph$Graph$alongOutgoingEdges,
			visitNode,
			$elm_community$graph$Graph$nodeIds(graph),
			acc,
			graph).a;
	});
var $elm_community$graph$Graph$Tree$MkTree = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm_community$graph$Graph$Tree$empty = A2($elm_community$graph$Graph$Tree$MkTree, 0, $elm$core$Maybe$Nothing);
var $elm_community$graph$Graph$Tree$isEmpty = function (tree) {
	return _Utils_eq(tree, $elm_community$graph$Graph$Tree$empty);
};
var $elm_community$graph$Graph$Tree$size = function (tree) {
	var n = tree.a;
	return n;
};
var $elm_community$graph$Graph$Tree$inner = F2(
	function (label, children) {
		var nonEmptyChildren = A2(
			$elm$core$List$filter,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm_community$graph$Graph$Tree$isEmpty),
			children);
		var totalSize = A3(
			$elm$core$List$foldl,
			A2($elm$core$Basics$composeL, $elm$core$Basics$add, $elm_community$graph$Graph$Tree$size),
			1,
			nonEmptyChildren);
		return A2(
			$elm_community$graph$Graph$Tree$MkTree,
			totalSize,
			$elm$core$Maybe$Just(
				_Utils_Tuple2(label, nonEmptyChildren)));
	});
var $elm_community$graph$Graph$dfsForest = F2(
	function (seeds, graph) {
		var visitNode = F2(
			function (ctx, trees) {
				return _Utils_Tuple2(
					_List_Nil,
					function (children) {
						return A2(
							$elm$core$List$cons,
							A2($elm_community$graph$Graph$Tree$inner, ctx, children),
							trees);
					});
			});
		return $elm$core$List$reverse(
			A5($elm_community$graph$Graph$guidedDfs, $elm_community$graph$Graph$alongOutgoingEdges, visitNode, seeds, _List_Nil, graph).a);
	});
var $elm$core$Result$mapError = F2(
	function (f, result) {
		if (!result.$) {
			var v = result.a;
			return $elm$core$Result$Ok(v);
		} else {
			var e = result.a;
			return $elm$core$Result$Err(
				f(e));
		}
	});
var $elm_community$graph$Graph$onFinish = F3(
	function (visitor, ctx, acc) {
		return _Utils_Tuple2(
			acc,
			visitor(ctx));
	});
var $elm_community$graph$Graph$Tree$listForTraversal = F2(
	function (traversal, tree) {
		var f = F3(
			function (label, children, rest) {
				return A2(
					$elm$core$Basics$composeR,
					$elm$core$List$cons(label),
					rest);
			});
		var acc = $elm$core$Basics$identity;
		return A4(traversal, f, acc, tree, _List_Nil);
	});
var $elm_community$graph$Graph$Tree$root = function (tree) {
	var maybe = tree.b;
	return maybe;
};
var $elm_community$graph$Graph$Tree$preOrder = F3(
	function (visit, acc, tree) {
		var folder = F2(
			function (b, a) {
				return A3($elm_community$graph$Graph$Tree$preOrder, visit, a, b);
			});
		var _v0 = $elm_community$graph$Graph$Tree$root(tree);
		if (_v0.$ === 1) {
			return acc;
		} else {
			var _v1 = _v0.a;
			var label = _v1.a;
			var children = _v1.b;
			return A3(
				$elm$core$List$foldl,
				folder,
				A3(visit, label, children, acc),
				children);
		}
	});
var $elm_community$graph$Graph$Tree$preOrderList = $elm_community$graph$Graph$Tree$listForTraversal($elm_community$graph$Graph$Tree$preOrder);
var $elm_community$intdict$IntDict$map = F2(
	function (f, dict) {
		switch (dict.$) {
			case 0:
				return $elm_community$intdict$IntDict$empty;
			case 1:
				var l = dict.a;
				return A2(
					$elm_community$intdict$IntDict$leaf,
					l.d7,
					A2(f, l.d7, l.eO));
			default:
				var i = dict.a;
				return A3(
					$elm_community$intdict$IntDict$inner,
					i.i,
					A2($elm_community$intdict$IntDict$map, f, i.d),
					A2($elm_community$intdict$IntDict$map, f, i.e));
		}
	});
var $elm_community$graph$Graph$reverseEdges = function () {
	var updateContext = F2(
		function (nodeId, ctx) {
			return _Utils_update(
				ctx,
				{d1: ctx.c2, c2: ctx.d1});
		});
	return A2(
		$elm$core$Basics$composeR,
		$elm_community$graph$Graph$unGraph,
		A2(
			$elm$core$Basics$composeR,
			$elm_community$intdict$IntDict$map(updateContext),
			$elm$core$Basics$identity));
}();
var $elm_community$graph$Graph$stronglyConnectedComponents = function (graph) {
	var reversePostOrder = A3(
		$elm_community$graph$Graph$dfs,
		$elm_community$graph$Graph$onFinish(
			A2(
				$elm$core$Basics$composeR,
				function ($) {
					return $.ej;
				},
				A2(
					$elm$core$Basics$composeR,
					function ($) {
						return $.b1;
					},
					$elm$core$List$cons))),
		_List_Nil,
		graph);
	return A2(
		$elm$core$Result$mapError,
		function (_v0) {
			var forest = A2(
				$elm_community$graph$Graph$dfsForest,
				reversePostOrder,
				$elm_community$graph$Graph$reverseEdges(graph));
			return A2(
				$elm$core$List$map,
				A2(
					$elm$core$Basics$composeR,
					$elm_community$graph$Graph$Tree$preOrderList,
					A2(
						$elm$core$Basics$composeR,
						A2($elm$core$List$foldr, $elm_community$graph$Graph$insert, $elm_community$graph$Graph$empty),
						$elm_community$graph$Graph$reverseEdges)),
				forest);
		},
		A2($elm_community$graph$Graph$checkForBackEdges, reversePostOrder, graph));
};
var $author$project$GossipProtocol$GossipProtocol$isStronglyConnected = F2(
	function (kind, graph) {
		var reduceContext = function (context) {
			return _Utils_update(
				context,
				{
					d1: A2(
						$elm_community$intdict$IntDict$filter,
						F2(
							function (_v1, r) {
								return A2($author$project$GossipGraph$Relation$isOfKind, r, kind);
							}),
						context.d1),
					c2: A2(
						$elm_community$intdict$IntDict$filter,
						F2(
							function (_v2, r) {
								return A2($author$project$GossipGraph$Relation$isOfKind, r, kind);
							}),
						context.c2)
				});
		};
		var kindGraph = A2($elm_community$graph$Graph$mapContexts, reduceContext, graph);
		var _v0 = $elm_community$graph$Graph$stronglyConnectedComponents(kindGraph);
		if (!_v0.$) {
			return false;
		} else {
			var components = _v0.a;
			return $elm$core$List$length(components) === 1;
		}
	});
var $elm$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			$elm$core$List$any,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, isOkay),
			list);
	});
var $elm$core$Dict$member = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$get, key, dict);
		if (!_v0.$) {
			return true;
		} else {
			return false;
		}
	});
var $elm$core$Set$member = F2(
	function (key, _v0) {
		var dict = _v0;
		return A2($elm$core$Dict$member, key, dict);
	});
var $elm_community$intdict$IntDict$uniteWith = F3(
	function (merger, l, r) {
		var mergeWith = F3(
			function (key, left, right) {
				var _v14 = _Utils_Tuple2(left, right);
				if (!_v14.a.$) {
					if (!_v14.b.$) {
						var l2 = _v14.a.a;
						var r2 = _v14.b.a;
						return $elm$core$Maybe$Just(
							A3(merger, key, l2, r2));
					} else {
						return left;
					}
				} else {
					if (!_v14.b.$) {
						return right;
					} else {
						var _v15 = _v14.a;
						var _v16 = _v14.b;
						return $elm$core$Maybe$Nothing;
					}
				}
			});
		var _v0 = _Utils_Tuple2(l, r);
		_v0$1:
		while (true) {
			_v0$2:
			while (true) {
				switch (_v0.a.$) {
					case 0:
						var _v1 = _v0.a;
						return r;
					case 1:
						switch (_v0.b.$) {
							case 0:
								break _v0$1;
							case 1:
								break _v0$2;
							default:
								break _v0$2;
						}
					default:
						switch (_v0.b.$) {
							case 0:
								break _v0$1;
							case 1:
								var r2 = _v0.b.a;
								return A3(
									$elm_community$intdict$IntDict$update,
									r2.d7,
									function (l_) {
										return A3(
											mergeWith,
											r2.d7,
											l_,
											$elm$core$Maybe$Just(r2.eO));
									},
									l);
							default:
								var il = _v0.a.a;
								var ir = _v0.b.a;
								var _v3 = A2($elm_community$intdict$IntDict$determineBranchRelation, il, ir);
								switch (_v3.$) {
									case 0:
										return A3(
											$elm_community$intdict$IntDict$inner,
											il.i,
											A3($elm_community$intdict$IntDict$uniteWith, merger, il.d, ir.d),
											A3($elm_community$intdict$IntDict$uniteWith, merger, il.e, ir.e));
									case 1:
										if (!_v3.a) {
											if (_v3.b === 1) {
												var _v4 = _v3.a;
												var _v5 = _v3.b;
												return A3(
													$elm_community$intdict$IntDict$inner,
													il.i,
													il.d,
													A3($elm_community$intdict$IntDict$uniteWith, merger, il.e, r));
											} else {
												var _v8 = _v3.a;
												var _v9 = _v3.b;
												return A3(
													$elm_community$intdict$IntDict$inner,
													il.i,
													A3($elm_community$intdict$IntDict$uniteWith, merger, il.d, r),
													il.e);
											}
										} else {
											if (_v3.b === 1) {
												var _v6 = _v3.a;
												var _v7 = _v3.b;
												return A3(
													$elm_community$intdict$IntDict$inner,
													ir.i,
													ir.d,
													A3($elm_community$intdict$IntDict$uniteWith, merger, l, ir.e));
											} else {
												var _v10 = _v3.a;
												var _v11 = _v3.b;
												return A3(
													$elm_community$intdict$IntDict$inner,
													ir.i,
													A3($elm_community$intdict$IntDict$uniteWith, merger, l, ir.d),
													ir.e);
											}
										}
									default:
										if (!_v3.b) {
											var parentPrefix = _v3.a;
											var _v12 = _v3.b;
											return A3($elm_community$intdict$IntDict$inner, parentPrefix, l, r);
										} else {
											var parentPrefix = _v3.a;
											var _v13 = _v3.b;
											return A3($elm_community$intdict$IntDict$inner, parentPrefix, r, l);
										}
								}
						}
				}
			}
			var l2 = _v0.a.a;
			return A3(
				$elm_community$intdict$IntDict$update,
				l2.d7,
				function (r_) {
					return A3(
						mergeWith,
						l2.d7,
						$elm$core$Maybe$Just(l2.eO),
						r_);
				},
				r);
		}
		var _v2 = _v0.b;
		return l;
	});
var $elm_community$graph$Graph$symmetricClosure = function (edgeMerger) {
	var orderedEdgeMerger = F4(
		function (from, to, outgoing, incoming) {
			return (_Utils_cmp(from, to) < 1) ? A4(edgeMerger, from, to, outgoing, incoming) : A4(edgeMerger, to, from, incoming, outgoing);
		});
	var updateContext = F2(
		function (nodeId, ctx) {
			var edges_ = A3(
				$elm_community$intdict$IntDict$uniteWith,
				orderedEdgeMerger(nodeId),
				ctx.c2,
				ctx.d1);
			return _Utils_update(
				ctx,
				{d1: edges_, c2: edges_});
		});
	return A2(
		$elm$core$Basics$composeR,
		$elm_community$graph$Graph$unGraph,
		A2(
			$elm$core$Basics$composeR,
			$elm_community$intdict$IntDict$map(updateContext),
			$elm$core$Basics$identity));
};
var $elm_community$intdict$IntDict$toList = function (dict) {
	return A3(
		$elm_community$intdict$IntDict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $author$project$GossipProtocol$GossipProtocol$isWeaklyConnected = F2(
	function (kind, graph) {
		var visitor = F2(
			function (ctx, acc) {
				return function (a) {
					return _Utils_Tuple2(a, $elm$core$Basics$identity);
				}(
					A3(
						$elm$core$List$foldr,
						$elm$core$Set$insert,
						acc,
						A2(
							$elm$core$List$map,
							A2(
								$elm$core$Basics$composeR,
								$elm$core$Tuple$second,
								function ($) {
									return $.aV;
								}),
							$elm_community$intdict$IntDict$toList(
								A2(
									$elm_community$intdict$IntDict$filter,
									F2(
										function (_v5, r) {
											return A2($author$project$GossipGraph$Relation$isOfKind, r, kind) && (!_Utils_eq(r.aV, r.ap));
										}),
									ctx.c2)))));
			});
		var merger = F4(
			function (_v2, _v3, outLabel, _v4) {
				return outLabel;
			});
		var firstNode = $elm$core$List$head(
			$elm_community$graph$Graph$nodeIds(graph));
		if (!firstNode.$) {
			var fn = firstNode.a;
			return function (_v1) {
				var reachableAgents = _v1.a;
				return function (allReachableAgents) {
					return A2(
						$elm$core$List$all,
						function (agent) {
							return A2($elm$core$Set$member, agent, allReachableAgents);
						},
						$elm_community$graph$Graph$nodeIds(graph));
				}(
					A2($elm$core$Set$insert, fn, reachableAgents));
			}(
				A5(
					$elm_community$graph$Graph$guidedDfs,
					$elm_community$graph$Graph$alongOutgoingEdges,
					visitor,
					_List_fromArray(
						[fn]),
					$elm$core$Set$empty,
					A2($elm_community$graph$Graph$symmetricClosure, merger, graph)));
		} else {
			return false;
		}
	});
var $elm$html$Html$span = _VirtualDom_node('span');
var $author$project$Main$connectionInfoView = F2(
	function (kind, graph) {
		var weaklyConnected = A2(
			$author$project$GossipProtocol$GossipProtocol$isWeaklyConnected,
			kind,
			A2($elm$core$Result$withDefault, $elm_community$graph$Graph$empty, graph));
		var stronglyConnected = A2(
			$author$project$GossipProtocol$GossipProtocol$isStronglyConnected,
			kind,
			A2($elm$core$Result$withDefault, $elm_community$graph$Graph$empty, graph));
		var relationType = function () {
			if (!kind) {
				return 'Number relation';
			} else {
				return 'Secret relation';
			}
		}();
		var icon = function () {
			if (!kind) {
				return $elm$html$Html$text('N');
			} else {
				return $elm$html$Html$text('S');
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('connection-info')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('visible')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('icon')
								]),
							_List_fromArray(
								[icon])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('explanation')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(relationType)
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('divider')
						]),
					_List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							stronglyConnected ? $elm$html$Html$Attributes$class('visible') : $elm$html$Html$Attributes$class('')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('icon')
								]),
							_List_fromArray(
								[
									$lattyware$elm_fontawesome$FontAwesome$Icon$viewIcon($lattyware$elm_fontawesome$FontAwesome$Solid$dumbbell)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('explanation')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									'This relation is ' + ((stronglyConnected ? '' : 'not') + ' strongly connected.'))
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							weaklyConnected ? $elm$html$Html$Attributes$class('visible') : $elm$html$Html$Attributes$class('')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('icon')
								]),
							_List_fromArray(
								[
									$lattyware$elm_fontawesome$FontAwesome$Icon$viewIcon($lattyware$elm_fontawesome$FontAwesome$Solid$feather)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('explanation')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									'This relation is ' + ((weaklyConnected ? '' : 'not') + ' weakly connected.'))
								]))
						]))
				]));
	});
var $lattyware$elm_fontawesome$FontAwesome$Attributes$fa7x = $elm$svg$Svg$Attributes$class('fa-7x');
var $elm$html$Html$Attributes$for = $elm$html$Html$Attributes$stringProperty('htmlFor');
var $author$project$Main$InsertExampleGraph = function (a) {
	return {$: 6, a: a};
};
var $author$project$Main$gossipGraphExamples = _List_fromArray(
	[
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('These are some examples')
			])),
		A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('input-group')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$type_('button'),
						$elm$html$Html$Events$onClick(
						$author$project$Main$InsertExampleGraph('Abc aBc abC'))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Only numbers')
					])),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$type_('button'),
						$elm$html$Html$Events$onClick(
						$author$project$Main$InsertExampleGraph('ABC ABC ABC'))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('All Secrets')
					])),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$type_('button'),
						$elm$html$Html$Events$onClick(
						$author$project$Main$InsertExampleGraph('Xyaz Axzy ZyAb BaZX Y'))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Complex example')
					]))
			]))
	]);
var $elm$html$Html$a = _VirtualDom_node('a');
var $elm$html$Html$Attributes$href = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var $author$project$Main$gossipGraphHelpView = _List_fromArray(
	[
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('You can enter a text representation of a gossip graph here. Examples of valid input are '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('Abc aBc abC')
					])),
				$elm$html$Html$text(', '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('A B C')
					])),
				$elm$html$Html$text(' and '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('abC Abc aBc')
					])),
				$elm$html$Html$text('. The first unique uppercase letter of each segment is taken as the name of the agent represented by that segment. (So in the last example, the first agent is called “C”, the second “A” and the last “B”)')
			])),
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('\n            Knowing how agents are named, it becomes easier to read these strings. \n            They represent both the agents and relations between agents at the same time.\n            An uppercase letter represents a “secret” relation S, and a lowercase letter represents a “number” relation N.\n            For example, the string\n            '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('A B C')
					])),
				$elm$html$Html$text('\n             contains the identity relation on S for the agents A, B and C.\n            Additionally, all agents who know another agent\'s secret are also assumed to know that agent\'s number.\n            ')
			])),
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('Lastly, the icons in the top-left corner provide some information about the current graph. When you hover over them, you are shown extra details.')
			])),
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('This notation is based on the notation in the appendix of '),
				A2(
				$elm$html$Html$a,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$href('https://arxiv.org/abs/1907.12321')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('van Ditmarsch et al. (2019)')
					])),
				$elm$html$Html$text('.')
			])),
		A2($author$project$Utils$Alert$render, 0, 'The next version of this application will allow an alternative input format: Instead of the letter-based format, a list-like format will be implemented. The string Ab aB will look like ([[0, 1], [0, 1]], [[0], [1]]).')
	]);
var $elm$html$Html$label = _VirtualDom_node('label');
var $elm_community$typed_svg$TypedSvg$Types$Align = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm_community$typed_svg$TypedSvg$Types$Meet = 0;
var $elm_community$typed_svg$TypedSvg$Types$ScaleMid = 1;
var $elm$core$Basics$cos = _Basics_cos;
var $elm$core$Basics$pi = _Basics_pi;
var $elm$core$Basics$sqrt = _Basics_sqrt;
var $gampleman$elm_visualization$Force$initialAngle = $elm$core$Basics$pi * (3 - $elm$core$Basics$sqrt(5));
var $gampleman$elm_visualization$Force$initialRadius = 10;
var $elm$core$Basics$sin = _Basics_sin;
var $gampleman$elm_visualization$Force$entity = F2(
	function (index, a) {
		var radius = $elm$core$Basics$sqrt(index) * $gampleman$elm_visualization$Force$initialRadius;
		var angle = index * $gampleman$elm_visualization$Force$initialAngle;
		return {
			b1: index,
			eO: a,
			am: 0.0,
			an: 0.0,
			Y: radius * $elm$core$Basics$cos(angle),
			Z: radius * $elm$core$Basics$sin(angle)
		};
	});
var $author$project$GossipGraph$Renderer$agentToEntity = function (agent) {
	return A2($gampleman$elm_visualization$Force$entity, agent.b1, agent);
};
var $elm_community$typed_svg$TypedSvg$Core$attribute = $elm$virtual_dom$VirtualDom$attribute;
var $elm_community$typed_svg$TypedSvg$Attributes$id = $elm_community$typed_svg$TypedSvg$Core$attribute('id');
var $elm$virtual_dom$VirtualDom$nodeNS = function (tag) {
	return _VirtualDom_nodeNS(
		_VirtualDom_noScript(tag));
};
var $elm_community$typed_svg$TypedSvg$Core$node = $elm$virtual_dom$VirtualDom$nodeNS('http://www.w3.org/2000/svg');
var $elm_community$typed_svg$TypedSvg$marker = $elm_community$typed_svg$TypedSvg$Core$node('marker');
var $elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString = function (length) {
	switch (length.$) {
		case 0:
			var x = length.a;
			return $elm$core$String$fromFloat(x) + 'cm';
		case 1:
			var x = length.a;
			return $elm$core$String$fromFloat(x) + 'em';
		case 2:
			var x = length.a;
			return $elm$core$String$fromFloat(x) + 'ex';
		case 3:
			var x = length.a;
			return $elm$core$String$fromFloat(x) + 'in';
		case 4:
			var x = length.a;
			return $elm$core$String$fromFloat(x) + 'mm';
		case 5:
			var x = length.a;
			return $elm$core$String$fromFloat(x);
		case 6:
			var x = length.a;
			return $elm$core$String$fromFloat(x) + 'pc';
		case 7:
			var x = length.a;
			return $elm$core$String$fromFloat(x) + '%';
		case 8:
			var x = length.a;
			return $elm$core$String$fromFloat(x) + 'pt';
		default:
			var x = length.a;
			return $elm$core$String$fromFloat(x) + 'px';
	}
};
var $elm_community$typed_svg$TypedSvg$Attributes$markerHeight = function (mHeight) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'markerHeight',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(mHeight));
};
var $elm_community$typed_svg$TypedSvg$Attributes$markerWidth = function (mWidth) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'markerWidth',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(mWidth));
};
var $elm_community$typed_svg$TypedSvg$Attributes$orient = $elm_community$typed_svg$TypedSvg$Core$attribute('orient');
var $elm_community$typed_svg$TypedSvg$Attributes$points = function (pts) {
	var pointToString = function (_v0) {
		var xx = _v0.a;
		var yy = _v0.b;
		return $elm$core$String$fromFloat(xx) + (', ' + $elm$core$String$fromFloat(yy));
	};
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'points',
		A2(
			$elm$core$String$join,
			' ',
			A2($elm$core$List$map, pointToString, pts)));
};
var $elm_community$typed_svg$TypedSvg$polygon = $elm_community$typed_svg$TypedSvg$Core$node('polygon');
var $elm_community$typed_svg$TypedSvg$Types$Px = function (a) {
	return {$: 9, a: a};
};
var $elm_community$typed_svg$TypedSvg$Types$px = $elm_community$typed_svg$TypedSvg$Types$Px;
var $elm_community$typed_svg$TypedSvg$Attributes$refX = $elm_community$typed_svg$TypedSvg$Core$attribute('refX');
var $elm_community$typed_svg$TypedSvg$Attributes$refY = $elm_community$typed_svg$TypedSvg$Core$attribute('refY');
var $author$project$GossipGraph$Renderer$arrowHeads = function (settings) {
	var width = settings.bm;
	var height = settings.bm;
	var yMid = height / 2;
	return _List_fromArray(
		[
			A2(
			$elm_community$typed_svg$TypedSvg$marker,
			_List_fromArray(
				[
					$elm_community$typed_svg$TypedSvg$Attributes$id('arrow-head-end'),
					$elm_community$typed_svg$TypedSvg$Attributes$markerWidth(
					$elm_community$typed_svg$TypedSvg$Types$px(width)),
					$elm_community$typed_svg$TypedSvg$Attributes$markerHeight(
					$elm_community$typed_svg$TypedSvg$Types$px(height)),
					$elm_community$typed_svg$TypedSvg$Attributes$refX('0'),
					$elm_community$typed_svg$TypedSvg$Attributes$refY(
					$elm$core$String$fromFloat(yMid)),
					$elm_community$typed_svg$TypedSvg$Attributes$orient('auto')
				]),
			_List_fromArray(
				[
					A2(
					$elm_community$typed_svg$TypedSvg$polygon,
					_List_fromArray(
						[
							$elm_community$typed_svg$TypedSvg$Attributes$points(
							_List_fromArray(
								[
									_Utils_Tuple2(0, 0),
									_Utils_Tuple2(width, yMid),
									_Utils_Tuple2(0, height)
								]))
						]),
					_List_Nil)
				])),
			A2(
			$elm_community$typed_svg$TypedSvg$marker,
			_List_fromArray(
				[
					$elm_community$typed_svg$TypedSvg$Attributes$id('arrow-head-start'),
					$elm_community$typed_svg$TypedSvg$Attributes$markerWidth(
					$elm_community$typed_svg$TypedSvg$Types$px(width)),
					$elm_community$typed_svg$TypedSvg$Attributes$markerHeight(
					$elm_community$typed_svg$TypedSvg$Types$px(height)),
					$elm_community$typed_svg$TypedSvg$Attributes$refX(
					$elm$core$String$fromFloat(width)),
					$elm_community$typed_svg$TypedSvg$Attributes$refY(
					$elm$core$String$fromFloat(yMid)),
					$elm_community$typed_svg$TypedSvg$Attributes$orient('auto')
				]),
			_List_fromArray(
				[
					A2(
					$elm_community$typed_svg$TypedSvg$polygon,
					_List_fromArray(
						[
							$elm_community$typed_svg$TypedSvg$Attributes$points(
							_List_fromArray(
								[
									_Utils_Tuple2(width, 0),
									_Utils_Tuple2(0, yMid),
									_Utils_Tuple2(width, height)
								]))
						]),
					_List_Nil)
				]))
		]);
};
var $gampleman$elm_visualization$Force$Center = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $gampleman$elm_visualization$Force$center = $gampleman$elm_visualization$Force$Center;
var $elm_community$typed_svg$TypedSvg$Attributes$class = function (names) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'class',
		A2($elm$core$String$join, ' ', names));
};
var $gampleman$elm_visualization$Force$isCompleted = function (_v0) {
	var alpha = _v0.a_;
	var minAlpha = _v0.cV;
	return _Utils_cmp(alpha, minAlpha) < 1;
};
var $gampleman$elm_visualization$Force$State = $elm$core$Basics$identity;
var $elm$core$Dict$map = F2(
	function (func, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				A2(func, key, value),
				A2($elm$core$Dict$map, func, left),
				A2($elm$core$Dict$map, func, right));
		}
	});
var $gampleman$elm_visualization$Force$nTimes = F3(
	function (fn, times, input) {
		nTimes:
		while (true) {
			if (times <= 0) {
				return input;
			} else {
				var $temp$fn = fn,
					$temp$times = times - 1,
					$temp$input = fn(input);
				fn = $temp$fn;
				times = $temp$times;
				input = $temp$input;
				continue nTimes;
			}
		}
	});
var $elm$core$Basics$pow = _Basics_pow;
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (!_v0.$) {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$maxX = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.a6;
};
var $ianmackenzie$elm_geometry$BoundingBox2d$maxY = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.a7;
};
var $ianmackenzie$elm_geometry$BoundingBox2d$minX = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.a8;
};
var $ianmackenzie$elm_geometry$BoundingBox2d$minY = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.a9;
};
var $ianmackenzie$elm_units$Quantity$Quantity = $elm$core$Basics$identity;
var $ianmackenzie$elm_units$Quantity$minus = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return x - y;
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$dimensions = function (boundingBox) {
	return _Utils_Tuple2(
		A2(
			$ianmackenzie$elm_units$Quantity$minus,
			$ianmackenzie$elm_geometry$BoundingBox2d$minX(boundingBox),
			$ianmackenzie$elm_geometry$BoundingBox2d$maxX(boundingBox)),
		A2(
			$ianmackenzie$elm_units$Quantity$minus,
			$ianmackenzie$elm_geometry$BoundingBox2d$minY(boundingBox),
			$ianmackenzie$elm_geometry$BoundingBox2d$maxY(boundingBox)));
};
var $elm$core$Basics$abs = function (n) {
	return (n < 0) ? (-n) : n;
};
var $ianmackenzie$elm_units$Quantity$zero = 0;
var $ianmackenzie$elm_geometry$Point2d$distanceFrom = F2(
	function (_v0, _v1) {
		var p1 = _v0;
		var p2 = _v1;
		var deltaY = p2.Z - p1.Z;
		var deltaX = p2.Y - p1.Y;
		var largestComponent = A2(
			$elm$core$Basics$max,
			$elm$core$Basics$abs(deltaX),
			$elm$core$Basics$abs(deltaY));
		if (!largestComponent) {
			return $ianmackenzie$elm_units$Quantity$zero;
		} else {
			var scaledY = deltaY / largestComponent;
			var scaledX = deltaX / largestComponent;
			var scaledLength = $elm$core$Basics$sqrt((scaledX * scaledX) + (scaledY * scaledY));
			return scaledLength * largestComponent;
		}
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Vector2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Vector2d$from = F2(
	function (_v0, _v1) {
		var p1 = _v0;
		var p2 = _v1;
		return {Y: p2.Y - p1.Y, Z: p2.Z - p1.Z};
	});
var $ianmackenzie$elm_units$Pixels$inPixels = function (_v0) {
	var numPixels = _v0;
	return numPixels;
};
var $ianmackenzie$elm_units_prefixed$Units$Pixels$inPixels = $ianmackenzie$elm_units$Pixels$inPixels;
var $elm$core$Basics$isNaN = _Basics_isNaN;
var $ianmackenzie$elm_geometry$Vector2d$length = function (_v0) {
	var v = _v0;
	var largestComponent = A2(
		$elm$core$Basics$max,
		$elm$core$Basics$abs(v.Y),
		$elm$core$Basics$abs(v.Z));
	if (!largestComponent) {
		return $ianmackenzie$elm_units$Quantity$zero;
	} else {
		var scaledY = v.Z / largestComponent;
		var scaledX = v.Y / largestComponent;
		var scaledLength = $elm$core$Basics$sqrt((scaledX * scaledX) + (scaledY * scaledY));
		return scaledLength * largestComponent;
	}
};
var $ianmackenzie$elm_geometry$Vector2d$plus = F2(
	function (_v0, _v1) {
		var v2 = _v0;
		var v1 = _v1;
		return {Y: v1.Y + v2.Y, Z: v1.Z + v2.Z};
	});
var $ianmackenzie$elm_units$Quantity$ratio = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return x / y;
	});
var $ianmackenzie$elm_units_prefixed$Units$Quantity$ratio = $ianmackenzie$elm_units$Quantity$ratio;
var $ianmackenzie$elm_geometry$Vector2d$scaleBy = F2(
	function (k, _v0) {
		var v = _v0;
		return {Y: k * v.Y, Z: k * v.Z};
	});
var $ianmackenzie$elm_geometry$Vector2d$sumHelp = F3(
	function (sumX, sumY, vectors) {
		sumHelp:
		while (true) {
			if (vectors.b) {
				var x = vectors.a.Y;
				var y = vectors.a.Z;
				var rest = vectors.b;
				var $temp$sumX = sumX + x,
					$temp$sumY = sumY + y,
					$temp$vectors = rest;
				sumX = $temp$sumX;
				sumY = $temp$sumY;
				vectors = $temp$vectors;
				continue sumHelp;
			} else {
				return {Y: sumX, Z: sumY};
			}
		}
	});
var $ianmackenzie$elm_geometry$Vector2d$sum = function (vectors) {
	return A3($ianmackenzie$elm_geometry$Vector2d$sumHelp, 0, 0, vectors);
};
var $ianmackenzie$elm_geometry$Vector2d$zero = {Y: 0, Z: 0};
var $gampleman$elm_visualization$Force$ManyBody$applyForce = F4(
	function (alpha, theta, qtree, vertex) {
		var isFarAway = function (treePart) {
			var distance = A2($ianmackenzie$elm_geometry$Point2d$distanceFrom, vertex.fB, treePart.dE.fB);
			var _v2 = $ianmackenzie$elm_geometry$BoundingBox2d$dimensions(treePart.e_);
			var width = _v2.a;
			return _Utils_cmp(
				A2($ianmackenzie$elm_units_prefixed$Units$Quantity$ratio, width, distance),
				theta) < 0;
		};
		var calculateVelocity = F2(
			function (target, source) {
				var delta = A2($ianmackenzie$elm_geometry$Vector2d$from, target.fB, source.fB);
				var len = $ianmackenzie$elm_units_prefixed$Units$Pixels$inPixels(
					$ianmackenzie$elm_geometry$Vector2d$length(delta));
				var weight = (source.fN * alpha) / A2($elm$core$Basics$pow, len, 2);
				return $elm$core$Basics$isNaN(weight) ? $ianmackenzie$elm_geometry$Vector2d$zero : A2($ianmackenzie$elm_geometry$Vector2d$scaleBy, weight, delta);
			});
		var useAggregate = function (treePart) {
			return A2(calculateVelocity, vertex, treePart.dE);
		};
		switch (qtree.$) {
			case 0:
				return $ianmackenzie$elm_geometry$Vector2d$zero;
			case 1:
				var leaf = qtree.a;
				if (isFarAway(leaf)) {
					return useAggregate(leaf);
				} else {
					var applyForceFromPoint = F2(
						function (point, accum) {
							return _Utils_eq(point.d7, vertex.d7) ? accum : A2(
								$ianmackenzie$elm_geometry$Vector2d$plus,
								A2(calculateVelocity, vertex, point),
								accum);
						});
					var _v1 = leaf.e2;
					var first = _v1.a;
					var rest = _v1.b;
					return A3(
						$elm$core$List$foldl,
						applyForceFromPoint,
						$ianmackenzie$elm_geometry$Vector2d$zero,
						A2($elm$core$List$cons, first, rest));
				}
			default:
				var node = qtree.a;
				if (isFarAway(node)) {
					return useAggregate(node);
				} else {
					var helper = function (tree) {
						return A4($gampleman$elm_visualization$Force$ManyBody$applyForce, alpha, theta, tree, vertex);
					};
					return $ianmackenzie$elm_geometry$Vector2d$sum(
						_List_fromArray(
							[
								helper(node.fu),
								helper(node.fs),
								helper(node.fJ),
								helper(node.fP)
							]));
				}
		}
	});
var $ianmackenzie$elm_geometry$Point2d$coordinates = function (_v0) {
	var p = _v0;
	return _Utils_Tuple2(p.Y, p.Z);
};
var $ianmackenzie$elm_units$Quantity$divideBy = F2(
	function (divisor, _v0) {
		var value = _v0;
		return value / divisor;
	});
var $ianmackenzie$elm_units_prefixed$Units$Quantity$divideBy = $ianmackenzie$elm_units$Quantity$divideBy;
var $ianmackenzie$elm_units$Quantity$plus = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return x + y;
	});
var $ianmackenzie$elm_units_prefixed$Units$Quantity$plus = $ianmackenzie$elm_units$Quantity$plus;
var $ianmackenzie$elm_geometry$Geometry$Types$Point2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Point2d$xy = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return {Y: x, Z: y};
	});
var $gampleman$elm_visualization$Force$ManyBody$constructSuperPoint = F2(
	function (first, rest) {
		var initialStrength = first.fN;
		var initialPoint = $ianmackenzie$elm_geometry$Point2d$coordinates(first.fB);
		var folder = F2(
			function (point, _v3) {
				var _v4 = _v3.a;
				var accumX = _v4.a;
				var accumY = _v4.b;
				var strength = _v3.b;
				var size = _v3.c;
				var _v2 = $ianmackenzie$elm_geometry$Point2d$coordinates(point.fB);
				var x = _v2.a;
				var y = _v2.b;
				return _Utils_Tuple3(
					_Utils_Tuple2(
						A2($ianmackenzie$elm_units_prefixed$Units$Quantity$plus, x, accumX),
						A2($ianmackenzie$elm_units_prefixed$Units$Quantity$plus, y, accumY)),
					strength + point.fN,
					size + 1);
			});
		var _v0 = A3(
			$elm$core$List$foldl,
			folder,
			_Utils_Tuple3(initialPoint, initialStrength, 1),
			rest);
		var _v1 = _v0.a;
		var totalX = _v1.a;
		var totalY = _v1.b;
		var totalStrength = _v0.b;
		var totalSize = _v0.c;
		return {
			fB: A2(
				$ianmackenzie$elm_geometry$Point2d$xy,
				A2($ianmackenzie$elm_units_prefixed$Units$Quantity$divideBy, totalSize, totalX),
				A2($ianmackenzie$elm_units_prefixed$Units$Quantity$divideBy, totalSize, totalY)),
			fN: totalStrength
		};
	});
var $gampleman$elm_visualization$Force$ManyBody$config = {
	e3: $gampleman$elm_visualization$Force$ManyBody$constructSuperPoint,
	e4: $gampleman$elm_visualization$Force$ManyBody$constructSuperPoint,
	fV: function ($) {
		return $.fB;
	}
};
var $gampleman$elm_visualization$Force$QuadTree$Empty = {$: 0};
var $gampleman$elm_visualization$Force$QuadTree$empty = $gampleman$elm_visualization$Force$QuadTree$Empty;
var $gampleman$elm_visualization$Force$QuadTree$Leaf = function (a) {
	return {$: 1, a: a};
};
var $gampleman$elm_visualization$Force$QuadTree$Node = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$ge = _Utils_ge;
var $ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return _Utils_cmp(x, y) > -1;
	});
var $ianmackenzie$elm_units$Quantity$lessThanOrEqualTo = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return _Utils_cmp(x, y) < 1;
	});
var $ianmackenzie$elm_geometry$Point2d$xCoordinate = function (_v0) {
	var p = _v0;
	return p.Y;
};
var $ianmackenzie$elm_geometry$Point2d$yCoordinate = function (_v0) {
	var p = _v0;
	return p.Z;
};
var $ianmackenzie$elm_geometry$BoundingBox2d$contains = F2(
	function (point, boundingBox) {
		return A2(
			$ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo,
			$ianmackenzie$elm_geometry$BoundingBox2d$minX(boundingBox),
			$ianmackenzie$elm_geometry$Point2d$xCoordinate(point)) && (A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			$ianmackenzie$elm_geometry$BoundingBox2d$maxX(boundingBox),
			$ianmackenzie$elm_geometry$Point2d$xCoordinate(point)) && (A2(
			$ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo,
			$ianmackenzie$elm_geometry$BoundingBox2d$minY(boundingBox),
			$ianmackenzie$elm_geometry$Point2d$yCoordinate(point)) && A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			$ianmackenzie$elm_geometry$BoundingBox2d$maxY(boundingBox),
			$ianmackenzie$elm_geometry$Point2d$yCoordinate(point))));
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$extrema = function (_v0) {
	var boundingBoxExtrema = _v0;
	return boundingBoxExtrema;
};
var $ianmackenzie$elm_geometry$Geometry$Types$BoundingBox2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_units$Quantity$max = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return A2($elm$core$Basics$max, x, y);
	});
var $elm$core$Basics$min = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) < 0) ? x : y;
	});
var $ianmackenzie$elm_units$Quantity$min = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return A2($elm$core$Basics$min, x, y);
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema = function (given) {
	return (A2($ianmackenzie$elm_units$Quantity$lessThanOrEqualTo, given.a6, given.a8) && A2($ianmackenzie$elm_units$Quantity$lessThanOrEqualTo, given.a7, given.a9)) ? given : {
		a6: A2($ianmackenzie$elm_units$Quantity$max, given.a8, given.a6),
		a7: A2($ianmackenzie$elm_units$Quantity$max, given.a9, given.a7),
		a8: A2($ianmackenzie$elm_units$Quantity$min, given.a8, given.a6),
		a9: A2($ianmackenzie$elm_units$Quantity$min, given.a9, given.a7)
	};
};
var $ianmackenzie$elm_units_prefixed$Units$Quantity$minus = $ianmackenzie$elm_units$Quantity$minus;
var $gampleman$elm_visualization$Force$QuadTree$NE = 0;
var $gampleman$elm_visualization$Force$QuadTree$NW = 1;
var $gampleman$elm_visualization$Force$QuadTree$SE = 2;
var $gampleman$elm_visualization$Force$QuadTree$SW = 3;
var $ianmackenzie$elm_units$Quantity$interpolateFrom = F3(
	function (_v0, _v1, parameter) {
		var start = _v0;
		var end = _v1;
		return (parameter <= 0.5) ? (start + (parameter * (end - start))) : (end + ((1 - parameter) * (start - end)));
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$midX = function (_v0) {
	var boundingBox = _v0;
	return A3($ianmackenzie$elm_units$Quantity$interpolateFrom, boundingBox.a8, boundingBox.a6, 0.5);
};
var $ianmackenzie$elm_geometry$BoundingBox2d$midY = function (_v0) {
	var boundingBox = _v0;
	return A3($ianmackenzie$elm_units$Quantity$interpolateFrom, boundingBox.a9, boundingBox.a7, 0.5);
};
var $ianmackenzie$elm_geometry$BoundingBox2d$centerPoint = function (boundingBox) {
	return A2(
		$ianmackenzie$elm_geometry$Point2d$xy,
		$ianmackenzie$elm_geometry$BoundingBox2d$midX(boundingBox),
		$ianmackenzie$elm_geometry$BoundingBox2d$midY(boundingBox));
};
var $ianmackenzie$elm_units_prefixed$Units$Quantity$greaterThanOrEqualTo = $ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo;
var $gampleman$elm_visualization$Force$QuadTree$quadrant = F2(
	function (boundingBox, point) {
		var _v0 = $ianmackenzie$elm_geometry$Point2d$coordinates(point);
		var x = _v0.a;
		var y = _v0.b;
		var _v1 = $ianmackenzie$elm_geometry$Point2d$coordinates(
			$ianmackenzie$elm_geometry$BoundingBox2d$centerPoint(boundingBox));
		var midX = _v1.a;
		var midY = _v1.b;
		var _v2 = $ianmackenzie$elm_geometry$BoundingBox2d$extrema(boundingBox);
		var minX = _v2.a8;
		var minY = _v2.a9;
		var maxX = _v2.a6;
		var maxY = _v2.a7;
		return A2($ianmackenzie$elm_units_prefixed$Units$Quantity$greaterThanOrEqualTo, midY, y) ? (A2($ianmackenzie$elm_units_prefixed$Units$Quantity$greaterThanOrEqualTo, midX, x) ? 0 : 1) : (A2($ianmackenzie$elm_units_prefixed$Units$Quantity$greaterThanOrEqualTo, midX, x) ? 2 : 3);
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$singleton = function (point) {
	return {
		a6: $ianmackenzie$elm_geometry$Point2d$xCoordinate(point),
		a7: $ianmackenzie$elm_geometry$Point2d$yCoordinate(point),
		a8: $ianmackenzie$elm_geometry$Point2d$xCoordinate(point),
		a9: $ianmackenzie$elm_geometry$Point2d$yCoordinate(point)
	};
};
var $gampleman$elm_visualization$Force$QuadTree$singleton = F2(
	function (toPoint, vertex) {
		return $gampleman$elm_visualization$Force$QuadTree$Leaf(
			{
				dE: 0,
				e_: $ianmackenzie$elm_geometry$BoundingBox2d$singleton(
					toPoint(vertex)),
				e2: _Utils_Tuple2(vertex, _List_Nil)
			});
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$union = F2(
	function (firstBox, secondBox) {
		var b2 = $ianmackenzie$elm_geometry$BoundingBox2d$extrema(secondBox);
		var b1 = $ianmackenzie$elm_geometry$BoundingBox2d$extrema(firstBox);
		return {
			a6: A2($ianmackenzie$elm_units$Quantity$max, b1.a6, b2.a6),
			a7: A2($ianmackenzie$elm_units$Quantity$max, b1.a7, b2.a7),
			a8: A2($ianmackenzie$elm_units$Quantity$min, b1.a8, b2.a8),
			a9: A2($ianmackenzie$elm_units$Quantity$min, b1.a9, b2.a9)
		};
	});
var $gampleman$elm_visualization$Force$QuadTree$insertBy = F3(
	function (toPoint, vertex, qtree) {
		switch (qtree.$) {
			case 0:
				return $gampleman$elm_visualization$Force$QuadTree$Leaf(
					{
						dE: 0,
						e_: $ianmackenzie$elm_geometry$BoundingBox2d$singleton(
							toPoint(vertex)),
						e2: _Utils_Tuple2(vertex, _List_Nil)
					});
			case 1:
				var leaf = qtree.a;
				var maxSize = 32;
				var _v1 = leaf.e2;
				var first = _v1.a;
				var rest = _v1.b;
				var newSize = 2 + $elm$core$List$length(rest);
				if (_Utils_cmp(newSize, maxSize) > -1) {
					var initial = $gampleman$elm_visualization$Force$QuadTree$Node(
						{
							dE: 0,
							e_: A2(
								$ianmackenzie$elm_geometry$BoundingBox2d$union,
								leaf.e_,
								$ianmackenzie$elm_geometry$BoundingBox2d$singleton(
									toPoint(vertex))),
							fs: $gampleman$elm_visualization$Force$QuadTree$Empty,
							fu: $gampleman$elm_visualization$Force$QuadTree$Empty,
							fJ: $gampleman$elm_visualization$Force$QuadTree$Empty,
							fP: $gampleman$elm_visualization$Force$QuadTree$Empty
						});
					return A3(
						$elm$core$List$foldl,
						$gampleman$elm_visualization$Force$QuadTree$insertBy(toPoint),
						initial,
						A2($elm$core$List$cons, first, rest));
				} else {
					return $gampleman$elm_visualization$Force$QuadTree$Leaf(
						{
							dE: 0,
							e_: A2(
								$ianmackenzie$elm_geometry$BoundingBox2d$union,
								leaf.e_,
								$ianmackenzie$elm_geometry$BoundingBox2d$singleton(
									toPoint(vertex))),
							e2: _Utils_Tuple2(
								vertex,
								A2($elm$core$List$cons, first, rest))
						});
				}
			default:
				var node = qtree.a;
				var point = toPoint(vertex);
				if (A2($ianmackenzie$elm_geometry$BoundingBox2d$contains, point, node.e_)) {
					var _v2 = A2($gampleman$elm_visualization$Force$QuadTree$quadrant, node.e_, point);
					switch (_v2) {
						case 0:
							return $gampleman$elm_visualization$Force$QuadTree$Node(
								{
									dE: node.dE,
									e_: node.e_,
									fs: A3($gampleman$elm_visualization$Force$QuadTree$insertBy, toPoint, vertex, node.fs),
									fu: node.fu,
									fJ: node.fJ,
									fP: node.fP
								});
						case 2:
							return $gampleman$elm_visualization$Force$QuadTree$Node(
								{
									dE: node.dE,
									e_: node.e_,
									fs: node.fs,
									fu: node.fu,
									fJ: A3($gampleman$elm_visualization$Force$QuadTree$insertBy, toPoint, vertex, node.fJ),
									fP: node.fP
								});
						case 1:
							return $gampleman$elm_visualization$Force$QuadTree$Node(
								{
									dE: node.dE,
									e_: node.e_,
									fs: node.fs,
									fu: A3($gampleman$elm_visualization$Force$QuadTree$insertBy, toPoint, vertex, node.fu),
									fJ: node.fJ,
									fP: node.fP
								});
						default:
							return $gampleman$elm_visualization$Force$QuadTree$Node(
								{
									dE: node.dE,
									e_: node.e_,
									fs: node.fs,
									fu: node.fu,
									fJ: node.fJ,
									fP: A3($gampleman$elm_visualization$Force$QuadTree$insertBy, toPoint, vertex, node.fP)
								});
					}
				} else {
					var _v3 = $ianmackenzie$elm_geometry$BoundingBox2d$extrema(node.e_);
					var minX = _v3.a8;
					var minY = _v3.a9;
					var maxX = _v3.a6;
					var maxY = _v3.a7;
					var _v4 = $ianmackenzie$elm_geometry$BoundingBox2d$dimensions(node.e_);
					var width = _v4.a;
					var height = _v4.b;
					var _v5 = A2($gampleman$elm_visualization$Force$QuadTree$quadrant, node.e_, point);
					switch (_v5) {
						case 0:
							return $gampleman$elm_visualization$Force$QuadTree$Node(
								{
									dE: 0,
									e_: $ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema(
										{
											a6: A2($ianmackenzie$elm_units_prefixed$Units$Quantity$plus, width, maxX),
											a7: A2($ianmackenzie$elm_units_prefixed$Units$Quantity$plus, height, maxY),
											a8: minX,
											a9: minY
										}),
									fs: A2($gampleman$elm_visualization$Force$QuadTree$singleton, toPoint, vertex),
									fu: $gampleman$elm_visualization$Force$QuadTree$Empty,
									fJ: $gampleman$elm_visualization$Force$QuadTree$Empty,
									fP: qtree
								});
						case 2:
							return $gampleman$elm_visualization$Force$QuadTree$Node(
								{
									dE: 0,
									e_: $ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema(
										{
											a6: A2($ianmackenzie$elm_units_prefixed$Units$Quantity$plus, width, maxX),
											a7: maxY,
											a8: minX,
											a9: A2($ianmackenzie$elm_units_prefixed$Units$Quantity$minus, height, minY)
										}),
									fs: $gampleman$elm_visualization$Force$QuadTree$Empty,
									fu: qtree,
									fJ: A2($gampleman$elm_visualization$Force$QuadTree$singleton, toPoint, vertex),
									fP: $gampleman$elm_visualization$Force$QuadTree$Empty
								});
						case 1:
							return $gampleman$elm_visualization$Force$QuadTree$Node(
								{
									dE: 0,
									e_: $ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema(
										{
											a6: maxX,
											a7: A2($ianmackenzie$elm_units_prefixed$Units$Quantity$plus, height, maxY),
											a8: A2($ianmackenzie$elm_units_prefixed$Units$Quantity$minus, width, minX),
											a9: minY
										}),
									fs: $gampleman$elm_visualization$Force$QuadTree$Empty,
									fu: A2($gampleman$elm_visualization$Force$QuadTree$singleton, toPoint, vertex),
									fJ: qtree,
									fP: $gampleman$elm_visualization$Force$QuadTree$Empty
								});
						default:
							return $gampleman$elm_visualization$Force$QuadTree$Node(
								{
									dE: 0,
									e_: $ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema(
										{
											a6: maxX,
											a7: maxY,
											a8: A2($ianmackenzie$elm_units_prefixed$Units$Quantity$minus, width, minX),
											a9: A2($ianmackenzie$elm_units_prefixed$Units$Quantity$minus, height, minY)
										}),
									fs: qtree,
									fu: $gampleman$elm_visualization$Force$QuadTree$Empty,
									fJ: $gampleman$elm_visualization$Force$QuadTree$Empty,
									fP: A2($gampleman$elm_visualization$Force$QuadTree$singleton, toPoint, vertex)
								});
					}
				}
		}
	});
var $gampleman$elm_visualization$Force$QuadTree$fromList = function (toPoint) {
	return A2(
		$elm$core$List$foldl,
		$gampleman$elm_visualization$Force$QuadTree$insertBy(toPoint),
		$gampleman$elm_visualization$Force$QuadTree$empty);
};
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $gampleman$elm_visualization$Force$QuadTree$getAggregate = function (qtree) {
	switch (qtree.$) {
		case 0:
			return $elm$core$Maybe$Nothing;
		case 1:
			var aggregate = qtree.a.dE;
			return $elm$core$Maybe$Just(aggregate);
		default:
			var aggregate = qtree.a.dE;
			return $elm$core$Maybe$Just(aggregate);
	}
};
var $gampleman$elm_visualization$Force$QuadTree$performAggregate = F2(
	function (config, vanillaQuadTree) {
		var combineAggregates = config.e3;
		var combineVertices = config.e4;
		switch (vanillaQuadTree.$) {
			case 0:
				return $gampleman$elm_visualization$Force$QuadTree$Empty;
			case 1:
				var leaf = vanillaQuadTree.a;
				var _v1 = leaf.e2;
				var first = _v1.a;
				var rest = _v1.b;
				return $gampleman$elm_visualization$Force$QuadTree$Leaf(
					{
						dE: A2(combineVertices, first, rest),
						e_: leaf.e_,
						e2: _Utils_Tuple2(first, rest)
					});
			default:
				var node = vanillaQuadTree.a;
				var newSw = A2($gampleman$elm_visualization$Force$QuadTree$performAggregate, config, node.fP);
				var newSe = A2($gampleman$elm_visualization$Force$QuadTree$performAggregate, config, node.fJ);
				var newNw = A2($gampleman$elm_visualization$Force$QuadTree$performAggregate, config, node.fu);
				var newNe = A2($gampleman$elm_visualization$Force$QuadTree$performAggregate, config, node.fs);
				var subresults = A2(
					$elm$core$List$filterMap,
					$gampleman$elm_visualization$Force$QuadTree$getAggregate,
					_List_fromArray(
						[newNw, newSw, newNe, newSe]));
				if (!subresults.b) {
					return $gampleman$elm_visualization$Force$QuadTree$Empty;
				} else {
					var x = subresults.a;
					var xs = subresults.b;
					return $gampleman$elm_visualization$Force$QuadTree$Node(
						{
							dE: A2(combineAggregates, x, xs),
							e_: node.e_,
							fs: newNe,
							fu: newNw,
							fJ: newSe,
							fP: newSw
						});
				}
		}
	});
var $gampleman$elm_visualization$Force$ManyBody$manyBody = F3(
	function (alpha, theta, vertices) {
		var withAggregates = A2(
			$gampleman$elm_visualization$Force$QuadTree$performAggregate,
			$gampleman$elm_visualization$Force$ManyBody$config,
			A2(
				$gampleman$elm_visualization$Force$QuadTree$fromList,
				function ($) {
					return $.fB;
				},
				vertices));
		var updateVertex = function (vertex) {
			return _Utils_update(
				vertex,
				{
					bS: A2(
						$ianmackenzie$elm_geometry$Vector2d$plus,
						vertex.bS,
						A4($gampleman$elm_visualization$Force$ManyBody$applyForce, alpha, theta, withAggregates, vertex))
				});
		};
		return A2($elm$core$List$map, updateVertex, vertices);
	});
var $ianmackenzie$elm_geometry$Point2d$pixels = F2(
	function (x, y) {
		return {Y: x, Z: y};
	});
var $ianmackenzie$elm_geometry$Vector2d$toPixels = function (_v0) {
	var vectorComponents = _v0;
	return vectorComponents;
};
var $gampleman$elm_visualization$Force$ManyBody$wrapper = F4(
	function (alpha, theta, strengths, points) {
		var vertices = A2(
			$elm$core$List$map,
			function (_v1) {
				var key = _v1.a;
				var point = _v1.b;
				var x = point.Y;
				var y = point.Z;
				var strength = A2(
					$elm$core$Maybe$withDefault,
					0,
					A2($elm$core$Dict$get, key, strengths));
				return {
					d7: key,
					fB: A2($ianmackenzie$elm_geometry$Point2d$pixels, x, y),
					fN: strength,
					bS: $ianmackenzie$elm_geometry$Vector2d$zero
				};
			},
			$elm$core$Dict$toList(points));
		var updater = F2(
			function (newVertex, maybePoint) {
				if (maybePoint.$ === 1) {
					return $elm$core$Maybe$Nothing;
				} else {
					var point = maybePoint.a;
					var dv = $ianmackenzie$elm_geometry$Vector2d$toPixels(newVertex.bS);
					return $elm$core$Maybe$Just(
						_Utils_update(
							point,
							{am: point.am + dv.Y, an: point.an + dv.Z}));
				}
			});
		var newVertices = A3($gampleman$elm_visualization$Force$ManyBody$manyBody, alpha, theta, vertices);
		var folder = F2(
			function (newVertex, pointsDict) {
				return A3(
					$elm$core$Dict$update,
					newVertex.d7,
					updater(newVertex),
					pointsDict);
			});
		return A3($elm$core$List$foldl, folder, points, newVertices);
	});
var $gampleman$elm_visualization$Force$applyForce = F3(
	function (alpha, force, entities) {
		switch (force.$) {
			case 0:
				var x = force.a;
				var y = force.b;
				var n = $elm$core$Dict$size(entities);
				var _v1 = A3(
					$elm$core$Dict$foldr,
					F3(
						function (_v2, ent, _v3) {
							var sx0 = _v3.a;
							var sy0 = _v3.b;
							return _Utils_Tuple2(sx0 + ent.Y, sy0 + ent.Z);
						}),
					_Utils_Tuple2(0, 0),
					entities);
				var sumx = _v1.a;
				var sumy = _v1.b;
				var sx = (sumx / n) - x;
				var sy = (sumy / n) - y;
				return A2(
					$elm$core$Dict$map,
					F2(
						function (_v4, ent) {
							return _Utils_update(
								ent,
								{Y: ent.Y - sx, Z: ent.Z - sy});
						}),
					entities);
			case 1:
				var _float = force.a;
				var collisionParamidDict = force.b;
				return entities;
			case 2:
				var iters = force.a;
				var lnks = force.b;
				return A3(
					$gampleman$elm_visualization$Force$nTimes,
					function (entitiesList) {
						return A3(
							$elm$core$List$foldl,
							F2(
								function (_v5, ents) {
									var source = _v5.fL;
									var target = _v5.fR;
									var distance = _v5.e9;
									var strength = _v5.fN;
									var bias = _v5.cm;
									var _v6 = _Utils_Tuple2(
										A2($elm$core$Dict$get, source, ents),
										A2($elm$core$Dict$get, target, ents));
									if ((!_v6.a.$) && (!_v6.b.$)) {
										var sourceNode = _v6.a.a;
										var targetNode = _v6.b.a;
										var y = ((targetNode.Z + targetNode.an) - sourceNode.Z) - sourceNode.an;
										var x = ((targetNode.Y + targetNode.am) - sourceNode.Y) - sourceNode.am;
										var d = $elm$core$Basics$sqrt(
											A2($elm$core$Basics$pow, x, 2) + A2($elm$core$Basics$pow, y, 2));
										var l = (((d - distance) / d) * alpha) * strength;
										return A3(
											$elm$core$Dict$update,
											source,
											$elm$core$Maybe$map(
												function (tn) {
													return _Utils_update(
														tn,
														{am: tn.am + ((x * l) * (1 - bias)), an: tn.an + ((y * l) * (1 - bias))});
												}),
											A3(
												$elm$core$Dict$update,
												target,
												$elm$core$Maybe$map(
													function (sn) {
														return _Utils_update(
															sn,
															{am: sn.am - ((x * l) * bias), an: sn.an - ((y * l) * bias)});
													}),
												ents));
									} else {
										var otherwise = _v6;
										return ents;
									}
								}),
							entitiesList,
							lnks);
					},
					iters,
					entities);
			case 3:
				var theta = force.a;
				var entityStrengths = force.b;
				return A4($gampleman$elm_visualization$Force$ManyBody$wrapper, alpha, theta, entityStrengths, entities);
			case 4:
				var directionalParamidDict = force.a;
				return entities;
			default:
				var directionalParamidDict = force.a;
				return entities;
		}
	});
var $elm$core$Dict$values = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return A2($elm$core$List$cons, value, valueList);
			}),
		_List_Nil,
		dict);
};
var $gampleman$elm_visualization$Force$tick = F2(
	function (_v0, nodes) {
		var state = _v0;
		var updateEntity = function (ent) {
			return _Utils_update(
				ent,
				{am: ent.am * state.bT, an: ent.an * state.bT, Y: ent.Y + (ent.am * state.bT), Z: ent.Z + (ent.an * state.bT)});
		};
		var dictNodes = A3(
			$elm$core$List$foldl,
			function (node) {
				return A2($elm$core$Dict$insert, node.b1, node);
			},
			$elm$core$Dict$empty,
			nodes);
		var alpha = state.a_ + ((state.dG - state.a_) * state.ci);
		var newNodes = A3(
			$elm$core$List$foldl,
			$gampleman$elm_visualization$Force$applyForce(alpha),
			dictNodes,
			state.dW);
		return _Utils_Tuple2(
			_Utils_update(
				state,
				{a_: alpha}),
			A2(
				$elm$core$List$map,
				updateEntity,
				$elm$core$Dict$values(newNodes)));
	});
var $gampleman$elm_visualization$Force$computeSimulation = F2(
	function (state, entities) {
		computeSimulation:
		while (true) {
			if ($gampleman$elm_visualization$Force$isCompleted(state)) {
				return entities;
			} else {
				var _v0 = A2($gampleman$elm_visualization$Force$tick, state, entities);
				var newState = _v0.a;
				var newEntities = _v0.b;
				var $temp$state = newState,
					$temp$entities = newEntities;
				state = $temp$state;
				entities = $temp$entities;
				continue computeSimulation;
			}
		}
	});
var $gampleman$elm_visualization$Force$Links = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $gampleman$elm_visualization$Force$customLinks = F2(
	function (iters, list) {
		var counts = A3(
			$elm$core$List$foldr,
			F2(
				function (_v1, d) {
					var source = _v1.fL;
					var target = _v1.fR;
					return A3(
						$elm$core$Dict$update,
						target,
						A2(
							$elm$core$Basics$composeL,
							A2(
								$elm$core$Basics$composeL,
								$elm$core$Maybe$Just,
								$elm$core$Maybe$withDefault(1)),
							$elm$core$Maybe$map(
								$elm$core$Basics$add(1))),
						A3(
							$elm$core$Dict$update,
							source,
							A2(
								$elm$core$Basics$composeL,
								A2(
									$elm$core$Basics$composeL,
									$elm$core$Maybe$Just,
									$elm$core$Maybe$withDefault(1)),
								$elm$core$Maybe$map(
									$elm$core$Basics$add(1))),
							d));
				}),
			$elm$core$Dict$empty,
			list);
		var count = function (key) {
			return A2(
				$elm$core$Maybe$withDefault,
				0,
				A2($elm$core$Dict$get, key, counts));
		};
		return A2(
			$gampleman$elm_visualization$Force$Links,
			iters,
			A2(
				$elm$core$List$map,
				function (_v0) {
					var source = _v0.fL;
					var target = _v0.fR;
					var distance = _v0.e9;
					var strength = _v0.fN;
					return {
						cm: count(source) / (count(source) + count(target)),
						e9: distance,
						fL: source,
						fN: A2(
							$elm$core$Maybe$withDefault,
							1 / A2(
								$elm$core$Basics$min,
								count(source),
								count(target)),
							strength),
						fR: target
					};
				},
				list));
	});
var $elm_community$typed_svg$TypedSvg$defs = $elm_community$typed_svg$TypedSvg$Core$node('defs');
var $elm_community$graph$Graph$edges = function (graph) {
	var flippedFoldl = F3(
		function (f, dict, list) {
			return A3($elm_community$intdict$IntDict$foldl, f, list, dict);
		});
	var prependEdges = F2(
		function (node1, ctx) {
			return A2(
				flippedFoldl,
				F2(
					function (node2, e) {
						return $elm$core$List$cons(
							{ap: node1, fo: e, aV: node2});
					}),
				ctx.c2);
		});
	return A3(
		flippedFoldl,
		prependEdges,
		$elm_community$graph$Graph$unGraph(graph),
		_List_Nil);
};
var $elm_community$typed_svg$TypedSvg$g = $elm_community$typed_svg$TypedSvg$Core$node('g');
var $author$project$GossipGraph$Renderer$getLinks = function (graph) {
	return A2(
		$elm$core$List$map,
		function (edge) {
			return {
				e9: 150,
				fL: edge.ap,
				fN: $elm$core$Maybe$Just(3),
				fR: edge.aV
			};
		},
		A2(
			$elm$core$List$filter,
			function (_v0) {
				var from = _v0.ap;
				var to = _v0.aV;
				return !_Utils_eq(from, to);
			},
			$elm_community$graph$Graph$edges(graph)));
};
var $gampleman$elm_visualization$Force$ManyBody = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $gampleman$elm_visualization$Force$customManyBody = function (theta) {
	return A2(
		$elm$core$Basics$composeR,
		$elm$core$Dict$fromList,
		$gampleman$elm_visualization$Force$ManyBody(theta));
};
var $gampleman$elm_visualization$Force$manyBodyStrength = function (strength) {
	return A2(
		$elm$core$Basics$composeL,
		$gampleman$elm_visualization$Force$customManyBody(0.9),
		$elm$core$List$map(
			function (key) {
				return _Utils_Tuple2(key, strength);
			}));
};
var $elm_community$graph$Graph$mapNodes = function (f) {
	return A2(
		$elm_community$graph$Graph$fold,
		function (_v0) {
			var node = _v0.ej;
			var incoming = _v0.d1;
			var outgoing = _v0.c2;
			return $elm_community$graph$Graph$insert(
				{
					d1: incoming,
					ej: {
						b1: node.b1,
						fo: f(node.fo)
					},
					c2: outgoing
				});
		},
		$elm_community$graph$Graph$empty);
};
var $elm_community$typed_svg$TypedSvg$TypesToStrings$scaleToString = function (scale) {
	switch (scale) {
		case 0:
			return 'Min';
		case 1:
			return 'Mid';
		default:
			return 'Max';
	}
};
var $elm_community$typed_svg$TypedSvg$TypesToStrings$alignToString = function (align) {
	if (align.$ === 1) {
		return 'none';
	} else {
		var x = align.a;
		var y = align.b;
		return 'x' + ($elm_community$typed_svg$TypedSvg$TypesToStrings$scaleToString(x) + ('Y' + $elm_community$typed_svg$TypedSvg$TypesToStrings$scaleToString(y)));
	}
};
var $elm_community$typed_svg$TypedSvg$TypesToStrings$meetOrSliceToString = function (meetOrSlice) {
	if (!meetOrSlice) {
		return 'meet';
	} else {
		return 'slice';
	}
};
var $elm_community$typed_svg$TypedSvg$Attributes$preserveAspectRatio = F2(
	function (align, meetOrSlice) {
		return A2(
			$elm_community$typed_svg$TypedSvg$Core$attribute,
			'preserveAspectRatio',
			A2(
				$elm$core$String$join,
				' ',
				_List_fromArray(
					[
						$elm_community$typed_svg$TypedSvg$TypesToStrings$alignToString(align),
						$elm_community$typed_svg$TypedSvg$TypesToStrings$meetOrSliceToString(meetOrSlice)
					])));
	});
var $elm_community$typed_svg$TypedSvg$Types$Paint = function (a) {
	return {$: 0, a: a};
};
var $avh4$elm_color$Color$RgbaSpace = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $avh4$elm_color$Color$black = A4($avh4$elm_color$Color$RgbaSpace, 0 / 255, 0 / 255, 0 / 255, 1.0);
var $elm_community$typed_svg$TypedSvg$line = $elm_community$typed_svg$TypedSvg$Core$node('line');
var $elm_community$typed_svg$TypedSvg$Attributes$markerEnd = $elm_community$typed_svg$TypedSvg$Core$attribute('marker-end');
var $elm$core$Basics$asin = _Basics_asin;
var $author$project$GossipGraph$Renderer$radialOffsetValue = F4(
	function (source, target, xoff, yoff) {
		var _v0 = _Utils_Tuple2(
			_Utils_cmp(source.Y, target.Y) > 0,
			_Utils_cmp(source.Z, target.Z) > 0);
		if (_v0.a) {
			if (_v0.b) {
				return _Utils_Tuple2(source.Y - xoff, source.Z - yoff);
			} else {
				return _Utils_Tuple2(source.Y - xoff, source.Z + yoff);
			}
		} else {
			if (_v0.b) {
				return _Utils_Tuple2(source.Y + xoff, source.Z - yoff);
			} else {
				return _Utils_Tuple2(source.Y + xoff, source.Z + yoff);
			}
		}
	});
var $author$project$GossipGraph$Renderer$radialOffset = F4(
	function (source, target, sourceOffset, targetOffset) {
		var dy = $elm$core$Basics$abs(source.Z - target.Z);
		var dx = $elm$core$Basics$abs(source.Y - target.Y);
		var hyp = $elm$core$Basics$sqrt((dx * dx) + (dy * dy));
		var angle = $elm$core$Basics$asin(dy / hyp);
		var sourceOffsetX = sourceOffset * $elm$core$Basics$cos(angle);
		var sourceOffsetY = sourceOffset * $elm$core$Basics$sin(angle);
		var newSource = A4($author$project$GossipGraph$Renderer$radialOffsetValue, source, target, sourceOffsetX, sourceOffsetY);
		var targetOffsetX = targetOffset * $elm$core$Basics$cos(angle);
		var targetOffsetY = targetOffset * $elm$core$Basics$sin(angle);
		var newTarget = A4($author$project$GossipGraph$Renderer$radialOffsetValue, target, source, targetOffsetX, targetOffsetY);
		return _Utils_Tuple2(newSource, newTarget);
	});
var $elm$core$String$concat = function (strings) {
	return A2($elm$core$String$join, '', strings);
};
var $elm$core$Basics$round = _Basics_round;
var $avh4$elm_color$Color$toCssString = function (_v0) {
	var r = _v0.a;
	var g = _v0.b;
	var b = _v0.c;
	var a = _v0.d;
	var roundTo = function (x) {
		return $elm$core$Basics$round(x * 1000) / 1000;
	};
	var pct = function (x) {
		return $elm$core$Basics$round(x * 10000) / 100;
	};
	return $elm$core$String$concat(
		_List_fromArray(
			[
				'rgba(',
				$elm$core$String$fromFloat(
				pct(r)),
				'%,',
				$elm$core$String$fromFloat(
				pct(g)),
				'%,',
				$elm$core$String$fromFloat(
				pct(b)),
				'%,',
				$elm$core$String$fromFloat(
				roundTo(a)),
				')'
			]));
};
var $elm_community$typed_svg$TypedSvg$TypesToStrings$paintToString = function (paint) {
	switch (paint.$) {
		case 0:
			var color = paint.a;
			return $avh4$elm_color$Color$toCssString(color);
		case 1:
			var string = paint.a;
			return $elm$core$String$concat(
				_List_fromArray(
					['url(#', string, ')']));
		case 2:
			return 'context-fill';
		case 3:
			return 'context-stroke';
		default:
			return 'none';
	}
};
var $elm_community$typed_svg$TypedSvg$Attributes$stroke = A2(
	$elm$core$Basics$composeL,
	$elm_community$typed_svg$TypedSvg$Core$attribute('stroke'),
	$elm_community$typed_svg$TypedSvg$TypesToStrings$paintToString);
var $elm_community$typed_svg$TypedSvg$Attributes$strokeWidth = function (length) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'stroke-width',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(length));
};
var $elm_community$typed_svg$TypedSvg$Attributes$x1 = function (position) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'x1',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(position));
};
var $elm_community$typed_svg$TypedSvg$Attributes$x2 = function (position) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'x2',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(position));
};
var $elm_community$typed_svg$TypedSvg$Attributes$y1 = function (position) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'y1',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(position));
};
var $elm_community$typed_svg$TypedSvg$Attributes$y2 = function (position) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'y2',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(position));
};
var $author$project$GossipGraph$Renderer$renderEdgeDirected = F4(
	function (settings, extraAttributes, source, target) {
		var r2 = settings.aQ + (2 * settings.bm);
		var r1 = settings.aQ;
		var _v0 = A4($author$project$GossipGraph$Renderer$radialOffset, source, target, r1, r2);
		var src = _v0.a;
		var tgt = _v0.b;
		return A2(
			$elm_community$typed_svg$TypedSvg$line,
			_Utils_ap(
				_List_fromArray(
					[
						$elm_community$typed_svg$TypedSvg$Attributes$strokeWidth(
						$elm_community$typed_svg$TypedSvg$Types$px(settings.b$)),
						$elm_community$typed_svg$TypedSvg$Attributes$stroke(
						$elm_community$typed_svg$TypedSvg$Types$Paint($avh4$elm_color$Color$black)),
						$elm_community$typed_svg$TypedSvg$Attributes$markerEnd('url(#arrow-head-end)'),
						$elm_community$typed_svg$TypedSvg$Attributes$x1(
						$elm_community$typed_svg$TypedSvg$Types$px(src.a)),
						$elm_community$typed_svg$TypedSvg$Attributes$y1(
						$elm_community$typed_svg$TypedSvg$Types$px(src.b)),
						$elm_community$typed_svg$TypedSvg$Attributes$x2(
						$elm_community$typed_svg$TypedSvg$Types$px(tgt.a)),
						$elm_community$typed_svg$TypedSvg$Attributes$y2(
						$elm_community$typed_svg$TypedSvg$Types$px(tgt.b))
					]),
				extraAttributes),
			_List_Nil);
	});
var $author$project$GossipGraph$Renderer$fractionalModBy = F2(
	function (modulus, x) {
		return x - (modulus * $elm$core$Basics$floor(x / modulus));
	});
var $elm$core$Basics$fromPolar = function (_v0) {
	var radius = _v0.a;
	var theta = _v0.b;
	return _Utils_Tuple2(
		radius * $elm$core$Basics$cos(theta),
		radius * $elm$core$Basics$sin(theta));
};
var $elm$core$Basics$atan2 = _Basics_atan2;
var $elm$core$Basics$toPolar = function (_v0) {
	var x = _v0.a;
	var y = _v0.b;
	return _Utils_Tuple2(
		$elm$core$Basics$sqrt((x * x) + (y * y)),
		A2($elm$core$Basics$atan2, y, x));
};
var $author$project$GossipGraph$Renderer$angularOffset = F3(
	function (_v0, offset, node) {
		var x = _v0.a;
		var y = _v0.b;
		var dy = y - node.Z;
		var dx = x - node.Y;
		var _v1 = $elm$core$Basics$toPolar(
			_Utils_Tuple2(dx, dy));
		var r = _v1.a;
		var theta = _v1.b;
		var newAngle = A2($author$project$GossipGraph$Renderer$fractionalModBy, 2 * $elm$core$Basics$pi, theta - offset);
		var _v2 = $elm$core$Basics$fromPolar(
			_Utils_Tuple2(r, newAngle));
		var newX = _v2.a;
		var newY = _v2.b;
		return _Utils_Tuple2(node.Y + newX, node.Z + newY);
	});
var $author$project$GossipGraph$Renderer$renderEdgeOffset = F4(
	function (settings, extraAttributes, source, target) {
		var r2 = settings.aQ + (2 * settings.bm);
		var r1 = settings.aQ;
		var _v0 = A4($author$project$GossipGraph$Renderer$radialOffset, source, target, r1, r2);
		var newSource = _v0.a;
		var newTarget = _v0.b;
		var src = A3($author$project$GossipGraph$Renderer$angularOffset, newSource, $elm$core$Basics$pi / 16, source);
		var tgt = A3($author$project$GossipGraph$Renderer$angularOffset, newTarget, (-$elm$core$Basics$pi) / 16, target);
		return A2(
			$elm_community$typed_svg$TypedSvg$line,
			_Utils_ap(
				_List_fromArray(
					[
						$elm_community$typed_svg$TypedSvg$Attributes$strokeWidth(
						$elm_community$typed_svg$TypedSvg$Types$px(settings.b$)),
						$elm_community$typed_svg$TypedSvg$Attributes$stroke(
						$elm_community$typed_svg$TypedSvg$Types$Paint($avh4$elm_color$Color$black)),
						$elm_community$typed_svg$TypedSvg$Attributes$markerEnd('url(#arrow-head-end)'),
						$elm_community$typed_svg$TypedSvg$Attributes$x1(
						$elm_community$typed_svg$TypedSvg$Types$px(src.a)),
						$elm_community$typed_svg$TypedSvg$Attributes$y1(
						$elm_community$typed_svg$TypedSvg$Types$px(src.b)),
						$elm_community$typed_svg$TypedSvg$Attributes$x2(
						$elm_community$typed_svg$TypedSvg$Types$px(tgt.a)),
						$elm_community$typed_svg$TypedSvg$Attributes$y2(
						$elm_community$typed_svg$TypedSvg$Types$px(tgt.b))
					]),
				extraAttributes),
			_List_Nil);
	});
var $elm_community$typed_svg$TypedSvg$Attributes$strokeDasharray = $elm_community$typed_svg$TypedSvg$Core$attribute('stroke-dasharray');
var $author$project$GossipGraph$Renderer$renderEdge = F3(
	function (graph, settings, edge) {
		var retrieveEntity = A2(
			$elm$core$Basics$composeL,
			$elm$core$Maybe$withDefault(
				A2(
					$gampleman$elm_visualization$Force$entity,
					0,
					{b1: -1, cY: '?'})),
			$elm$core$Maybe$map(
				A2(
					$elm$core$Basics$composeR,
					function ($) {
						return $.ej;
					},
					function ($) {
						return $.fo;
					})));
		var source = retrieveEntity(
			A2($elm_community$graph$Graph$get, edge.ap, graph));
		var target = retrieveEntity(
			A2($elm_community$graph$Graph$get, edge.aV, graph));
		var dashed = (!edge.fo.d8) ? _List_fromArray(
			[
				$elm_community$typed_svg$TypedSvg$Attributes$strokeDasharray(
				$elm$core$String$fromFloat(settings.b$ * 2))
			]) : _List_Nil;
		return A2(
			$elm$core$List$any,
			function (e) {
				return _Utils_eq(edge.ap, e.aV) && _Utils_eq(edge.aV, e.ap);
			},
			$elm_community$graph$Graph$edges(graph)) ? A4($author$project$GossipGraph$Renderer$renderEdgeOffset, settings, dashed, source, target) : A4($author$project$GossipGraph$Renderer$renderEdgeDirected, settings, dashed, source, target);
	});
var $elm_community$typed_svg$TypedSvg$Types$AnchorMiddle = 2;
var $elm_community$typed_svg$TypedSvg$circle = $elm_community$typed_svg$TypedSvg$Core$node('circle');
var $elm_community$typed_svg$TypedSvg$Attributes$cx = function (length) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'cx',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(length));
};
var $elm_community$typed_svg$TypedSvg$Attributes$cy = function (length) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'cy',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(length));
};
var $elm_community$typed_svg$TypedSvg$Attributes$dy = function (length) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'dy',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(length));
};
var $elm_community$typed_svg$TypedSvg$Attributes$fill = A2(
	$elm$core$Basics$composeL,
	$elm_community$typed_svg$TypedSvg$Core$attribute('fill'),
	$elm_community$typed_svg$TypedSvg$TypesToStrings$paintToString);
var $elm_community$typed_svg$TypedSvg$Attributes$r = function (length) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'r',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(length));
};
var $elm_community$typed_svg$TypedSvg$Core$text = $elm$virtual_dom$VirtualDom$text;
var $elm_community$typed_svg$TypedSvg$TypesToStrings$anchorAlignmentToString = function (anchorAlignment) {
	switch (anchorAlignment) {
		case 0:
			return 'inherit';
		case 1:
			return 'start';
		case 2:
			return 'middle';
		default:
			return 'end';
	}
};
var $elm_community$typed_svg$TypedSvg$Attributes$textAnchor = function (anchorAlignment) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'text-anchor',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$anchorAlignmentToString(anchorAlignment));
};
var $elm_community$typed_svg$TypedSvg$text_ = $elm_community$typed_svg$TypedSvg$Core$node('text');
var $elm_community$typed_svg$TypedSvg$title = $elm_community$typed_svg$TypedSvg$Core$node('title');
var $avh4$elm_color$Color$white = A4($avh4$elm_color$Color$RgbaSpace, 255 / 255, 255 / 255, 255 / 255, 1.0);
var $elm_community$typed_svg$TypedSvg$Attributes$x = function (length) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'x',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(length));
};
var $elm_community$typed_svg$TypedSvg$Attributes$y = function (length) {
	return A2(
		$elm_community$typed_svg$TypedSvg$Core$attribute,
		'y',
		$elm_community$typed_svg$TypedSvg$TypesToStrings$lengthToString(length));
};
var $author$project$GossipGraph$Renderer$renderNode = F2(
	function (settings, node) {
		return A2(
			$elm_community$typed_svg$TypedSvg$g,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm_community$typed_svg$TypedSvg$circle,
					_List_fromArray(
						[
							$elm_community$typed_svg$TypedSvg$Attributes$r(
							$elm_community$typed_svg$TypedSvg$Types$px(settings.aQ)),
							$elm_community$typed_svg$TypedSvg$Attributes$fill(
							$elm_community$typed_svg$TypedSvg$Types$Paint($avh4$elm_color$Color$white)),
							$elm_community$typed_svg$TypedSvg$Attributes$stroke(
							$elm_community$typed_svg$TypedSvg$Types$Paint($avh4$elm_color$Color$black)),
							$elm_community$typed_svg$TypedSvg$Attributes$strokeWidth(
							$elm_community$typed_svg$TypedSvg$Types$px(1)),
							$elm_community$typed_svg$TypedSvg$Attributes$cx(
							$elm_community$typed_svg$TypedSvg$Types$px(node.fo.Y)),
							$elm_community$typed_svg$TypedSvg$Attributes$cy(
							$elm_community$typed_svg$TypedSvg$Types$px(node.fo.Z))
						]),
					_List_fromArray(
						[
							A2(
							$elm_community$typed_svg$TypedSvg$title,
							_List_Nil,
							_List_fromArray(
								[
									$elm_community$typed_svg$TypedSvg$Core$text(
									$elm$core$String$fromChar(node.fo.eO.cY))
								]))
						])),
					A2(
					$elm_community$typed_svg$TypedSvg$text_,
					_List_fromArray(
						[
							$elm_community$typed_svg$TypedSvg$Attributes$textAnchor(2),
							$elm_community$typed_svg$TypedSvg$Attributes$x(
							$elm_community$typed_svg$TypedSvg$Types$px(node.fo.Y)),
							$elm_community$typed_svg$TypedSvg$Attributes$y(
							$elm_community$typed_svg$TypedSvg$Types$px(node.fo.Z)),
							$elm_community$typed_svg$TypedSvg$Attributes$dy(
							$elm_community$typed_svg$TypedSvg$Types$px(settings.aQ / 3))
						]),
					_List_fromArray(
						[
							$elm_community$typed_svg$TypedSvg$Core$text(
							$elm$core$String$fromChar(node.fo.eO.cY))
						]))
				]));
	});
var $gampleman$elm_visualization$Force$simulation = function (forces) {
	return {
		a_: 1.0,
		ci: 1 - A2($elm$core$Basics$pow, 0.001, 1 / 300),
		dG: 0.0,
		dW: forces,
		cV: 0.001,
		bT: 0.6
	};
};
var $elm_community$typed_svg$TypedSvg$svg = $elm_community$typed_svg$TypedSvg$Core$node('svg');
var $author$project$GossipGraph$Renderer$updateContextWithValue = F2(
	function (nodeCtx, value) {
		var node = nodeCtx.ej;
		return _Utils_update(
			nodeCtx,
			{
				ej: _Utils_update(
					node,
					{fo: value})
			});
	});
var $author$project$GossipGraph$Renderer$updateGraphWithList = function () {
	var graphUpdater = function (value) {
		return $elm$core$Maybe$map(
			function (ctx) {
				return A2($author$project$GossipGraph$Renderer$updateContextWithValue, ctx, value);
			});
	};
	return $elm$core$List$foldr(
		F2(
			function (node, graph) {
				return A3(
					$elm_community$graph$Graph$update,
					node.b1,
					graphUpdater(node),
					graph);
			}));
}();
var $elm_community$typed_svg$TypedSvg$Attributes$viewBox = F4(
	function (minX, minY, vWidth, vHeight) {
		return A2(
			$elm_community$typed_svg$TypedSvg$Core$attribute,
			'viewBox',
			A2(
				$elm$core$String$join,
				' ',
				A2(
					$elm$core$List$map,
					$elm$core$String$fromFloat,
					_List_fromArray(
						[minX, minY, vWidth, vHeight]))));
	});
var $author$project$GossipGraph$Renderer$renderGraph = F2(
	function (graph, settings) {
		var entityGraph = A2($elm_community$graph$Graph$mapNodes, $author$project$GossipGraph$Renderer$agentToEntity, graph);
		var forces = _List_fromArray(
			[
				A2(
				$gampleman$elm_visualization$Force$customLinks,
				3,
				$author$project$GossipGraph$Renderer$getLinks(entityGraph)),
				A2(
				$gampleman$elm_visualization$Force$manyBodyStrength,
				1000,
				A2(
					$elm$core$List$map,
					function ($) {
						return $.b1;
					},
					$elm_community$graph$Graph$nodes(entityGraph))),
				A2($gampleman$elm_visualization$Force$center, settings.cp / 2, settings.co / 2)
			]);
		var computedGraph = A2(
			$author$project$GossipGraph$Renderer$updateGraphWithList,
			entityGraph,
			A2(
				$gampleman$elm_visualization$Force$computeSimulation,
				$gampleman$elm_visualization$Force$simulation(forces),
				A2(
					$elm$core$List$map,
					function (n) {
						return n.fo;
					},
					$elm_community$graph$Graph$nodes(entityGraph))));
		return A2(
			$elm_community$typed_svg$TypedSvg$svg,
			_List_fromArray(
				[
					A4($elm_community$typed_svg$TypedSvg$Attributes$viewBox, 0, 0, settings.cp, settings.co),
					A2(
					$elm_community$typed_svg$TypedSvg$Attributes$preserveAspectRatio,
					A2($elm_community$typed_svg$TypedSvg$Types$Align, 1, 1),
					0)
				]),
			_List_fromArray(
				[
					A2(
					$elm_community$typed_svg$TypedSvg$defs,
					_List_Nil,
					$author$project$GossipGraph$Renderer$arrowHeads(settings)),
					A2(
					$elm_community$typed_svg$TypedSvg$g,
					_List_fromArray(
						[
							$elm_community$typed_svg$TypedSvg$Attributes$class(
							_List_fromArray(
								['links']))
						]),
					A2(
						$elm$core$List$map,
						A2($author$project$GossipGraph$Renderer$renderEdge, computedGraph, settings),
						A2(
							$elm$core$List$filter,
							function (e) {
								return !_Utils_eq(e.ap, e.aV);
							},
							$elm_community$graph$Graph$edges(computedGraph)))),
					A2(
					$elm_community$typed_svg$TypedSvg$g,
					_List_fromArray(
						[
							$elm_community$typed_svg$TypedSvg$Attributes$class(
							_List_fromArray(
								['nodes']))
						]),
					A2(
						$elm$core$List$map,
						$author$project$GossipGraph$Renderer$renderNode(settings),
						$elm_community$graph$Graph$nodes(computedGraph)))
				]));
	});
var $author$project$GossipGraph$Renderer$render = F2(
	function (graphResult, settings) {
		if (!graphResult.$) {
			var graph = graphResult.a;
			return A2($author$project$GossipGraph$Renderer$renderGraph, graph, settings);
		} else {
			var error = graphResult.a;
			return A2($author$project$Utils$Alert$render, 2, error);
		}
	});
var $elm_community$intdict$IntDict$isEmpty = function (dict) {
	if (!dict.$) {
		return true;
	} else {
		return false;
	}
};
var $author$project$GossipProtocol$GossipProtocol$isSunGraph = function (graph) {
	var prune = function (g) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (nodeid, _v0) {
					return A2($elm_community$graph$Graph$remove, nodeid, graph);
				}),
			g,
			A3(
				$elm_community$graph$Graph$fold,
				F2(
					function (ctx, acc) {
						return $elm_community$intdict$IntDict$isEmpty(
							A2($elm_community$intdict$IntDict$remove, ctx.ej.b1, ctx.c2)) ? A2($elm$core$List$cons, ctx.ej.b1, acc) : acc;
					}),
				_List_Nil,
				g));
	};
	return A2(
		$author$project$GossipProtocol$GossipProtocol$isStronglyConnected,
		0,
		prune(graph));
};
var $lattyware$elm_fontawesome$FontAwesome$Solid$sun = A5(
	$lattyware$elm_fontawesome$FontAwesome$Icon$Icon,
	'fas',
	'sun',
	512,
	512,
	_List_fromArray(
		['M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z']));
var $author$project$Main$sunInfoView = function (graph) {
	var isSunGraph = $author$project$GossipProtocol$GossipProtocol$isSunGraph(
		A2($elm$core$Result$withDefault, $elm_community$graph$Graph$empty, graph));
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('connection-info')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						isSunGraph ? $elm$html$Html$Attributes$class('visible') : $elm$html$Html$Attributes$class('')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('icon')
							]),
						_List_fromArray(
							[
								$lattyware$elm_fontawesome$FontAwesome$Icon$viewIcon($lattyware$elm_fontawesome$FontAwesome$Solid$sun)
							])),
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('explanation')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								'This graph is ' + ((isSunGraph ? '' : 'not') + ' a sun graph.'))
							]))
					]))
			]));
};
var $author$project$Main$gossipGraphView = function (model) {
	var graphIsValid = function () {
		var _v1 = _Utils_Tuple2(
			$elm$core$String$isEmpty(model.aa),
			model.t);
		if ((!_v1.a) && (!_v1.b.$)) {
			return true;
		} else {
			return false;
		}
	}();
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$id('graph')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$header,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h2,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Gossip graph')
							])),
						A2($author$project$Main$helpButtonView, 'Gossip Graphs', $author$project$Main$gossipGraphHelpView)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('columns')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$for('gossip-graph-input')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Gossip graph input')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('input-group')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$input,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('text'),
										$elm$html$Html$Attributes$id('gossip-graph-input'),
										$elm$html$Html$Attributes$value(model.aa),
										$elm$html$Html$Events$onInput($author$project$Main$ChangeGossipGraph),
										$elm$html$Html$Attributes$placeholder('Gossip graph representation')
									]),
								_List_Nil),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick(
										A2($author$project$Main$ShowModal, 'Gossip Graph input examples', $author$project$Main$gossipGraphExamples))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Examples')
									]))
							])),
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$for('canonical-graph-input')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Canonical representation')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('input-group')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$input,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('text'),
										$elm$html$Html$Attributes$id('canonical-graph-input'),
										$elm$html$Html$Attributes$disabled(true),
										$elm$html$Html$Attributes$value(model.bW),
										$elm$html$Html$Attributes$placeholder('Canonical representation')
									]),
								_List_Nil),
								A2($author$project$Main$helpButtonView, 'Canonical Representation', $author$project$Main$canonicalRepresentationInfoView)
							]))
					])),
				$elm$core$String$isEmpty(model.aa) ? A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('gossip-graph'),
						$elm$html$Html$Attributes$class('empty')
					]),
				_List_fromArray(
					[
						$lattyware$elm_fontawesome$FontAwesome$Icon$view(
						A2(
							$lattyware$elm_fontawesome$FontAwesome$Icon$styled,
							_List_fromArray(
								[$lattyware$elm_fontawesome$FontAwesome$Attributes$fa7x]),
							$lattyware$elm_fontawesome$FontAwesome$Icon$present($lattyware$elm_fontawesome$FontAwesome$Solid$chalkboard))),
						A2(
						$elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Type something above to see a graph!')
							]))
					])) : A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('gossip-graph')
					]),
				_List_fromArray(
					[
						A2($author$project$GossipGraph$Renderer$render, model.t, model.cz),
						function () {
						var _v0 = model.t;
						if (!_v0.$) {
							return A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('connection-info-container')
									]),
								_List_fromArray(
									[
										A2($author$project$Main$connectionInfoView, 0, model.t),
										A2($author$project$Main$connectionInfoView, 1, model.t),
										$author$project$Main$sunInfoView(model.t)
									]));
						} else {
							return A2($elm$html$Html$div, _List_Nil, _List_Nil);
						}
					}()
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('export-buttons'),
						$elm$html$Html$Attributes$class('input-group right')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$disabled(!graphIsValid),
								$elm$html$Html$Events$onClick(
								A2(
									$author$project$Main$ShowModal,
									'Coming soon',
									_List_fromArray(
										[
											A2(
											$elm$html$Html$p,
											_List_Nil,
											_List_fromArray(
												[
													A2($author$project$Utils$Alert$render, 0, 'This feature is coming soon.')
												]))
										])))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Generate LaTeX file')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$disabled(!graphIsValid),
								$elm$html$Html$Events$onClick(
								A2(
									$author$project$Main$ShowModal,
									'Coming soon',
									_List_fromArray(
										[
											A2(
											$elm$html$Html$p,
											_List_Nil,
											_List_fromArray(
												[
													A2($author$project$Utils$Alert$render, 0, 'This feature is coming soon.')
												]))
										])))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Copy GraphViz DOT code')
							]))
					]))
			]));
};
var $elm$html$Html$h1 = _VirtualDom_node('h1');
var $elm$html$Html$li = _VirtualDom_node('li');
var $elm$html$Html$ul = _VirtualDom_node('ul');
var $author$project$Main$headerHelpView = _List_fromArray(
	[
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('This application is intended as a tool to gain insight into dynamic gossip.\n            It allows you to visualise gossip graphs, execute different gossip protocols and see how calls influence the state of the gossip graph.')
			])),
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('This application was developed by Ramon Meffert ('),
				A2(
				$elm$html$Html$a,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$href('mailto:r.a.meffert@student.rug.nl')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('r.a.meffert@student.rug.nl')
					])),
				$elm$html$Html$text(') as part of his bachelor\'s research project under supervision of Dr. Malvin Gattinger.')
			])),
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('This tool is built on the following free software:')
			])),
		A2(
		$elm$html$Html$ul,
		_List_Nil,
		_List_fromArray(
			[
				A2(
				$elm$html$Html$li,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$a,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$href('https://elm-lang.org/')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Elm')
							])),
						$elm$html$Html$text(', a functional web language')
					])),
				A2(
				$elm$html$Html$li,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('A number of '),
						A2(
						$elm$html$Html$a,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$href('https://package.elm-lang.org/')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Elm packages')
							])),
						$elm$html$Html$text(' by the Elm commmunity')
					])),
				A2(
				$elm$html$Html$li,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$a,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$href('https://sass-lang.org/')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Sass')
							])),
						$elm$html$Html$text(' for better CSS')
					])),
				A2(
				$elm$html$Html$li,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$a,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$href('https://fontawesome.com/')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('FontAwesome')
							])),
						$elm$html$Html$text(' for the interface icons')
					])),
				A2(
				$elm$html$Html$li,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$a,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$href('https://iconmonstr.com/')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('IconMonstr')
							])),
						$elm$html$Html$text(' for the favicon')
					]))
			])),
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('The source code is available on '),
				A2(
				$elm$html$Html$a,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$href('https://github.com/RamonMeffert/tools-for-gossip')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('GitHub')
					])),
				$elm$html$Html$text('. Once finished, the accompanying thesis will also be made available.')
			]))
	]);
var $author$project$Main$headerView = A2(
	$elm$html$Html$header,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$id('header')
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$h1,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Tools for Gossip')
						])),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('subtitle')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Bachelor\'s project')
						])),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('subtitle')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('R.A. Meffert ('),
							A2(
							$elm$html$Html$a,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$href('mailto:r.a.meffert@student.rug.nl')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('r.a.meffert@student.rug.nl')
								])),
							$elm$html$Html$text(')')
						])),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('subtitle')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Supervisor: Dr. B.R.M. Gattinger')
						]))
				])),
			A2($author$project$Main$helpButtonView, 'Tools for Gossip', $author$project$Main$headerHelpView)
		]));
var $author$project$Main$TimeTravel = function (a) {
	return {$: 5, a: a};
};
var $lattyware$elm_fontawesome$FontAwesome$Solid$asterisk = A5(
	$lattyware$elm_fontawesome$FontAwesome$Icon$Icon,
	'fas',
	'asterisk',
	512,
	512,
	_List_fromArray(
		['M478.21 334.093L336 256l142.21-78.093c11.795-6.477 15.961-21.384 9.232-33.037l-19.48-33.741c-6.728-11.653-21.72-15.499-33.227-8.523L296 186.718l3.475-162.204C299.763 11.061 288.937 0 275.48 0h-38.96c-13.456 0-24.283 11.061-23.994 24.514L216 186.718 77.265 102.607c-11.506-6.976-26.499-3.13-33.227 8.523l-19.48 33.741c-6.728 11.653-2.562 26.56 9.233 33.037L176 256 33.79 334.093c-11.795 6.477-15.961 21.384-9.232 33.037l19.48 33.741c6.728 11.653 21.721 15.499 33.227 8.523L216 325.282l-3.475 162.204C212.237 500.939 223.064 512 236.52 512h38.961c13.456 0 24.283-11.061 23.995-24.514L296 325.282l138.735 84.111c11.506 6.976 26.499 3.13 33.227-8.523l19.48-33.741c6.728-11.653 2.563-26.559-9.232-33.036z']));
var $elm$html$Html$Attributes$classList = function (classes) {
	return $elm$html$Html$Attributes$class(
		A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$map,
				$elm$core$Tuple$first,
				A2($elm$core$List$filter, $elm$core$Tuple$second, classes))));
};
var $author$project$Main$ChangeExecutionTreeDepth = function (a) {
	return {$: 9, a: a};
};
var $author$project$Main$GenerateExecutionTree = {$: 10};
var $elm$html$Html$Attributes$max = $elm$html$Html$Attributes$stringProperty('max');
var $elm$html$Html$Attributes$min = $elm$html$Html$Attributes$stringProperty('min');
var $elm$html$Html$sup = _VirtualDom_node('sup');
var $author$project$Main$executionTreeModalView = function (model) {
	return _List_fromArray(
		[
			A2(
			$elm$html$Html$p,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text('You can generate the execution tree up until a specified depth here. The execution tree will be generated starting from the initial graph.')
				])),
			A2(
			$elm$html$Html$p,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text('If there already is a call history, the execution tree will be generated from that history\'s initial graph. Otherwise, the current graph will be taken as the initial graph.')
				])),
			A2(
			$elm$html$Html$label,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$for('execution-depth')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('Depth')
				])),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('input-group'),
					$elm$html$Html$Attributes$id('execution-depth')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('number'),
							$elm$html$Html$Attributes$min('0'),
							$elm$html$Html$Attributes$max('5'),
							$elm$html$Html$Attributes$value(
							$elm$core$String$fromInt(model.bu)),
							$elm$html$Html$Events$onInput($author$project$Main$ChangeExecutionTreeDepth)
						]),
					_List_Nil),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Events$onClick($author$project$Main$GenerateExecutionTree)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Generate')
						]))
				])),
			A2($author$project$Utils$Alert$render, 1, 'Depending on the size of the graph, this might generate a very large execution tree*. This might take some time! Clicking “Generate” will overwrite the current call history.'),
			A2(
			$elm$html$Html$p,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('note ')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('* If you take a 3-agent graph where all agents know each others numbers, and assume the '),
					A2(
					$elm$html$Html$code,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Any')
						])),
					$elm$html$Html$text(' protocol is selected, that means there are 6 calls to be made for every round, ending up with 6'),
					A2(
					$elm$html$Html$sup,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('d')
						])),
					$elm$html$Html$text(' history nodes (where d is the depth). For d = 5, that means 7,776 nodes!')
				]))
		]);
};
var $lattyware$elm_fontawesome$FontAwesome$Solid$fastForward = A5(
	$lattyware$elm_fontawesome$FontAwesome$Icon$Icon,
	'fas',
	'fast-forward',
	512,
	512,
	_List_fromArray(
		['M512 76v360c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12V284.1L276.5 440.6c-20.6 17.2-52.5 2.8-52.5-24.6V284.1L52.5 440.6C31.9 457.8 0 443.4 0 416V96c0-27.4 31.9-41.7 52.5-24.6L224 226.8V96c0-27.4 31.9-41.7 52.5-24.6L448 226.8V76c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12z']));
var $author$project$Main$historyHelpView = _List_fromArray(
	[
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('This section shows the history of calls that have been made. You can click any of the calls to time-travel to that state of the gossip graph.')
			]))
	]);
var $author$project$GossipGraph$Call$renderString = F2(
	function (agents, call) {
		var _v0 = _Utils_Tuple2(
			A2($author$project$GossipGraph$Agent$fromId, agents, call.ap),
			A2($author$project$GossipGraph$Agent$fromId, agents, call.aV));
		if ((!_v0.a.$) && (!_v0.b.$)) {
			var from = _v0.a.a;
			var to = _v0.b.a;
			return $elm$core$String$fromChar(from.cY) + (' 📞 ' + $elm$core$String$fromChar(to.cY));
		} else {
			return '❌';
		}
	});
var $zwilias$elm_rosetree$Tree$restructureHelp = F4(
	function (fLabel, fTree, acc, stack) {
		restructureHelp:
		while (true) {
			var _v0 = acc.y;
			if (!_v0.b) {
				var node = A2(
					fTree,
					acc.fo,
					$elm$core$List$reverse(acc.f));
				if (!stack.b) {
					return node;
				} else {
					var top = stack.a;
					var rest = stack.b;
					var $temp$fLabel = fLabel,
						$temp$fTree = fTree,
						$temp$acc = _Utils_update(
						top,
						{
							f: A2($elm$core$List$cons, node, top.f)
						}),
						$temp$stack = rest;
					fLabel = $temp$fLabel;
					fTree = $temp$fTree;
					acc = $temp$acc;
					stack = $temp$stack;
					continue restructureHelp;
				}
			} else {
				if (!_v0.a.b.b) {
					var _v2 = _v0.a;
					var l = _v2.a;
					var rest = _v0.b;
					var $temp$fLabel = fLabel,
						$temp$fTree = fTree,
						$temp$acc = _Utils_update(
						acc,
						{
							f: A2(
								$elm$core$List$cons,
								A2(
									fTree,
									fLabel(l),
									_List_Nil),
								acc.f),
							y: rest
						}),
						$temp$stack = stack;
					fLabel = $temp$fLabel;
					fTree = $temp$fTree;
					acc = $temp$acc;
					stack = $temp$stack;
					continue restructureHelp;
				} else {
					var _v3 = _v0.a;
					var l = _v3.a;
					var cs = _v3.b;
					var rest = _v0.b;
					var $temp$fLabel = fLabel,
						$temp$fTree = fTree,
						$temp$acc = {
						f: _List_Nil,
						fo: fLabel(l),
						y: cs
					},
						$temp$stack = A2(
						$elm$core$List$cons,
						_Utils_update(
							acc,
							{y: rest}),
						stack);
					fLabel = $temp$fLabel;
					fTree = $temp$fTree;
					acc = $temp$acc;
					stack = $temp$stack;
					continue restructureHelp;
				}
			}
		}
	});
var $zwilias$elm_rosetree$Tree$restructure = F3(
	function (convertLabel, convertTree, _v0) {
		var l = _v0.a;
		var c = _v0.b;
		return A4(
			$zwilias$elm_rosetree$Tree$restructureHelp,
			convertLabel,
			convertTree,
			{
				f: _List_Nil,
				fo: convertLabel(l),
				y: c
			},
			_List_Nil);
	});
var $author$project$Main$historyView = function (model) {
	var toListItems = F2(
		function (label, children) {
			if (!children.b) {
				return A2(
					$elm$html$Html$li,
					_List_Nil,
					_List_fromArray(
						[label]));
			} else {
				return A2(
					$elm$html$Html$li,
					_List_Nil,
					_List_fromArray(
						[
							label,
							A2($elm$html$Html$ul, _List_Nil, children)
						]));
			}
		});
	var renderCallHistoryNode = function (node) {
		switch (node.$) {
			case 0:
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Events$onClick(
							$author$project$Main$TimeTravel(0)),
							$elm$html$Html$Attributes$classList(
							_List_fromArray(
								[
									_Utils_Tuple2('call', true),
									_Utils_Tuple2('current', !model.ah)
								])),
							$elm$html$Html$Attributes$title('Initial Graph')
						]),
					_List_fromArray(
						[
							$lattyware$elm_fontawesome$FontAwesome$Icon$viewIcon($lattyware$elm_fontawesome$FontAwesome$Solid$asterisk)
						]));
			case 2:
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('dead-end'),
							$elm$html$Html$Attributes$title('No more calls are possible')
						]),
					_List_fromArray(
						[
							$lattyware$elm_fontawesome$FontAwesome$Icon$viewIcon($lattyware$elm_fontawesome$FontAwesome$Solid$times)
						]));
			default:
				var n = node.a;
				var _v1 = model.aL;
				if (!_v1.$) {
					var agents = _v1.a;
					return A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Events$onClick(
								$author$project$Main$TimeTravel(n.fl)),
								$elm$html$Html$Attributes$classList(
								_List_fromArray(
									[
										_Utils_Tuple2('call', true),
										_Utils_Tuple2(
										'current',
										_Utils_eq(model.ah, n.fl))
									]))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								A2($author$project$GossipGraph$Call$renderString, agents, n.e$))
							]));
				} else {
					var e = _v1.a;
					return A2(
						$elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('❌')
							]));
				}
		}
	};
	var renderTree = function (tree) {
		return function (root) {
			return A2(
				$elm$html$Html$ul,
				_List_Nil,
				_List_fromArray(
					[root]));
		}(
			A3($zwilias$elm_rosetree$Tree$restructure, renderCallHistoryNode, toListItems, tree));
	};
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$id('history')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$header,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h2,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Call history')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('input-set')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick(
										A2(
											$author$project$Main$ShowModal,
											'Execution Tree',
											$author$project$Main$executionTreeModalView(model)))
									]),
								_List_fromArray(
									[
										$lattyware$elm_fontawesome$FontAwesome$Icon$viewIcon($lattyware$elm_fontawesome$FontAwesome$Solid$fastForward)
									])),
								A2($author$project$Main$helpButtonView, 'Call history', $author$project$Main$historyHelpView)
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('execution-tree')
					]),
				_List_fromArray(
					[
						renderTree(model.w)
					]))
			]));
};
var $author$project$Main$HideModal = {$: 8};
var $elm$html$Html$h4 = _VirtualDom_node('h4');
var $author$project$Main$modalView = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$classList(
				_List_fromArray(
					[
						_Utils_Tuple2('modal-overlay', true),
						_Utils_Tuple2('visible', model.U.bk)
					]))
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-window')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$header,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-header')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h4,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text(model.U.cd)
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Attributes$title('Close window'),
										$elm$html$Html$Events$onClick($author$project$Main$HideModal)
									]),
								_List_fromArray(
									[
										$lattyware$elm_fontawesome$FontAwesome$Icon$viewIcon($lattyware$elm_fontawesome$FontAwesome$Solid$times)
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-content')
							]),
						model.U.cr)
					]))
			]));
};
var $author$project$Main$ChangeProtocol = function (a) {
	return {$: 2, a: a};
};
var $author$project$Main$ExecuteCall = function (a) {
	return {$: 3, a: a};
};
var $elm$html$Html$blockquote = _VirtualDom_node('blockquote');
var $elm$html$Html$cite = _VirtualDom_node('cite');
var $author$project$GossipProtocol$Conditions$Predefined$explanation = $elm$core$Dict$fromList(
	_List_fromArray(
		[
			_Utils_Tuple2(
			'any',
			_List_fromArray(
				[
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Until every agent knows all secrets, choose different agents x and y, such that x knows the number of y, and let x call y.')
						])),
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Represented by the boolean formula ⊤.')
						]))
				])),
			_Utils_Tuple2(
			'tok',
			_List_fromArray(
				[
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Until every agent knows all secrets, choose different agents x and y with x ≠ y, such that x knows y’s number and either x has not been in prior calls or the last call involving x was to x, and let x call y.')
						])),
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Represented by the boolean formula σₓ = ϵ ∨ σₓ = t;zx.')
						]))
				])),
			_Utils_Tuple2(
			'spi',
			_List_fromArray(
				[
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Until every agent knows all secrets, choose different agents x and y, such that x knows y’s number and either x has not been in prior calls or the last call involving x was from x, and let x call y.')
						])),
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Represented by the boolean formula σₓ = ϵ ∨ σₓ = t;xz.')
						]))
				])),
			_Utils_Tuple2(
			'wco',
			_List_fromArray(
				[
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Until every agent knows all secrets, choose different agents x and y, such that x knows the number of y and x did not call y before, and let x call y.')
						])),
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Represented by the boolean formula xy ∉ σₓ ∧ yx ∉ σₓ.')
						]))
				])),
			_Utils_Tuple2(
			'co',
			_List_fromArray(
				[
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Until every agent knows all secrets, choose different agents x and y, such that x knows the number of y and there was no prior call between x and y, and let x call y.')
						])),
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Represented by the boolean formula xy ∉ σₓ.')
						]))
				])),
			_Utils_Tuple2(
			'lns',
			_List_fromArray(
				[
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Until every agent knows all secrets, choose different agents x and y, such that x knows the number of y but not the secret of y, and let x call y.')
						])),
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Represented by the boolean formula ¬S'),
							A2(
							$elm$html$Html$sup,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('σ')
								])),
							$elm$html$Html$text('xy.')
						]))
				]))
		]));
var $elm$html$Html$footer = _VirtualDom_node('footer');
var $elm$html$Html$h3 = _VirtualDom_node('h3');
var $elm$html$Html$option = _VirtualDom_node('option');
var $author$project$Main$protocolHelpView = _List_fromArray(
	[
		A2(
		$elm$html$Html$p,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text('This section allows you to select one of the gossip protocols as defined by '),
				A2(
				$elm$html$Html$a,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$href('https://doi.org/10/cvpm')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('van Ditmarsch et al. (2018)')
					])),
				$elm$html$Html$text('. When you have selected a protocol, the possible calls for that protocol and the current gossip graph, together with the call history, will be shown. '),
				$elm$html$Html$text('Clicking the '),
				A2(
				$elm$html$Html$code,
				_List_Nil,
				_List_fromArray(
					[
						$lattyware$elm_fontawesome$FontAwesome$Icon$viewIcon($lattyware$elm_fontawesome$FontAwesome$Solid$question)
					])),
				$elm$html$Html$text(' icon will tell you the rules of the selected protocol.')
			])),
		A2($author$project$Utils$Alert$render, 0, 'In the next version of this application, you will be able to define custom gossip protocols using the constituents defined by van Ditmarsch et al. (2018).')
	]);
var $elm$html$Html$select = _VirtualDom_node('select');
var $author$project$Main$protocolView = function (model) {
	var protocolExplanation = function () {
		var _v2 = A2($elm$core$Dict$get, model.as, $author$project$GossipProtocol$Conditions$Predefined$explanation);
		if (!_v2.$) {
			var explanation = _v2.a;
			return _List_fromArray(
				[
					A2(
					$elm$html$Html$blockquote,
					_List_Nil,
					_List_fromArray(
						[
							A2($elm$html$Html$p, _List_Nil, explanation),
							A2(
							$elm$html$Html$footer,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$cite,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Based on '),
											A2(
											$elm$html$Html$a,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$href('https://doi.org/10/cvpm')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('van Ditmarsch et al. (2018)')
												]))
										]))
								]))
						]))
				]);
		} else {
			return (model.as === 'custom') ? _List_fromArray(
				[
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Custom')
						]))
				]) : _List_fromArray(
				[
					A2(
					$elm$html$Html$p,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Unknown protocol')
						]))
				]);
		}
	}();
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$id('protocols')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$header,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h2,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Gossip Protocols')
							])),
						A2($author$project$Main$helpButtonView, 'Gossip Protocols', $author$project$Main$protocolHelpView)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('input-group')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$select,
						_List_fromArray(
							[
								A2(
								$elm$html$Html$Events$on,
								'change',
								A2($elm$json$Json$Decode$map, $author$project$Main$ChangeProtocol, $elm$html$Html$Events$targetValue))
							]),
						_Utils_ap(
							A2(
								$elm$core$List$map,
								function (k) {
									return A2(
										$elm$html$Html$option,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$value(k)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												A2(
													$elm$core$Maybe$withDefault,
													'?',
													A2($elm$core$Dict$get, k, $author$project$GossipProtocol$Conditions$Predefined$name)))
											]));
								},
								$elm$core$Dict$keys($author$project$GossipProtocol$Conditions$Predefined$name)),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$option,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$value('custom'),
											$elm$html$Html$Attributes$disabled(true)
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Custom')
										]))
								]))),
						A2(
						$author$project$Main$helpButtonView,
						'Current protocol: ' + A2(
							$elm$core$Maybe$withDefault,
							'?',
							A2($elm$core$Dict$get, model.as, $author$project$GossipProtocol$Conditions$Predefined$name)),
						protocolExplanation)
					])),
				A2(
				$elm$html$Html$h3,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('Possible calls')
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('call-list')
					]),
				function () {
					var _v0 = _Utils_Tuple2(model.aL, model.t);
					if ((!_v0.a.$) && (!_v0.b.$)) {
						var agents = _v0.a.a;
						var graph = _v0.b.a;
						var calls = A3(
							$author$project$GossipProtocol$GossipProtocol$selectCalls,
							graph,
							model.aT,
							A3(
								$elm$core$List$foldr,
								F2(
									function (el, acc) {
										if (el.$ === 1) {
											var n = el.a;
											return A2($elm$core$List$cons, n.e$, acc);
										} else {
											return acc;
										}
									}),
								_List_Nil,
								$zwilias$elm_rosetree$Tree$flatten(model.w)));
						return $elm$core$String$isEmpty(model.aa) ? _List_fromArray(
							[
								$elm$html$Html$text('None')
							]) : ($elm$core$List$isEmpty(calls) ? _List_fromArray(
							[
								$elm$html$Html$text('All possible calls have been made.')
							]) : A2(
							$elm$core$List$map,
							function (call) {
								return A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('call'),
											$elm$html$Html$Events$onClick(
											$author$project$Main$ExecuteCall(call))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											A2($author$project$GossipGraph$Call$renderString, agents, call))
										]));
							},
							calls));
					} else {
						return _List_fromArray(
							[
								A2($author$project$Utils$Alert$render, 0, 'The call sequence below is impossible. I\'ll start looking for possible calls again when I understand the call sequence!')
							]);
					}
				}())
			]));
};
var $author$project$Main$view = function (model) {
	return {
		eZ: _List_fromArray(
			[
				$author$project$Main$headerView,
				$author$project$Main$gossipGraphView(model),
				$author$project$Main$historyView(model),
				$author$project$Main$protocolView(model),
				$author$project$Main$callSequenceView(model),
				$author$project$Main$modalView(model)
			]),
		cd: 'Tools for Gossip'
	};
};
var $author$project$Main$main = $elm$browser$Browser$document(
	{fm: $author$project$Main$init, fO: $author$project$Main$subscriptions, fY: $author$project$Main$update, fZ: $author$project$Main$view});
/*
_Platform_export({'Main':{'init':$author$project$Main$main(
	$elm$json$Json$Decode$succeed(0))(0)}});}(this));
*/
export const Elm = {'Main':{'init':$author$project$Main$main(
	$elm$json$Json$Decode$succeed(0))(0)}};
export default Elm;
