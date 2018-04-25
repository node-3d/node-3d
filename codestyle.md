# Javascript Code-Style


DISCLAIMER: These rules may or may not be linted, but are sure code-reviewed.
At least, linters are configured not to oppose the rules below.


## Spaces

1. Indent with tabs.
	
	```
			x = 4;
	// ^^^^^ - TABS
	```

1. Empty lines preserve indent.
	
	```
			if (a) {
				return;
			}
			
	// ^^^^^ - TABS
			if (b) {
				return;
			}
	```

1. Tabs are only in indentation, use spaces within lines.
	
	```
	const veryLongName = 1;
	const shortName    = 2;
	//             ^^^^ ^  like that
	```

1. No trailing spaces.
	
	```
	x = 4;
	//    ^^^^^ - NOTHING
	```

1. Operators have spaces around them.
	
	```
	if ( ! isOk ) {
	//  ^ ^ like this
		
		x = hasX ? value : 0;
	//   ^ ^    ^ ^     ^ ^ like this
		
		x += 5 * a - b + 0xFF & ~ 0xF7;
	//   ^  ^ ^ ^ ^ ^ ^ ^    ^ ^ ^ like this
		
		return;
	}
	```

1. Space after keyword is required.
	
	```
	function (
	function* (
	if (
	for (
	while (
	catch (
	```

1. No space after function name in a call.
	
	```
	return values.filter(x => x > 0).map(x => x * x);
	//            nope ^^         nope ^^
	```

1. Space before open brace if it is a block.
	
	```
	function () {
	function* () {
	for () {
	while () {
	else {
	try {
	```

1. Control flow operators (`if/else/for/while/try`) always have braces and newline.
Short functions (no more than 70 symbols) can be one-line.
	
	```
	if (isOk) {
		try {
			x = JSON.parse(text);
		} catch (ex) {
			console.log('Error', ex);
		}
		return x;
	} else {
		return 0;
	}
	```

1. Spaces are symmetric.
	
	```
	if ( something(somethingElse(x)) ) {
	//  ^ if here, then also here   ^
		return;
	}
	```

1. Two empty lines between separate functions/methods.
	
	```
	class WunderWaffe {
		constructor() {
			this.x = 1;
		}
		↕
		↕
		// ^^ two newlines above
		destroy() {
			this.x = 0;
		}
	}
	```

1. At least one whitespace after a comma, and no whitespace before a comma.
	
	```
	// BAD
	const a = 10
		, b = 11
		, c = 12
		;
	
	// GOOD
	const a = 10, b = 11, c = 12;
	
	// GOOD
	const z = [
		1,
		2,
		3,
	];
	```


## Comments

Comments start on a new line. A short note may be placed at the end of a short string
(under 50 symbols long).
Comment operators should be surrounded by whitespace (newline, tab, space).
New-line comments start with capital letter, while end-line notes start lowercase.
[JsDoc](http://usejsdoc.org) comments welcome for entities. Actions can be commented
by single line comments, see example below.
However, too extensive commenting is discouraged. Good code should be readable without
comments.

```
	/**
	 * @file Manages the configuration settings for the widget.
	 * @author Rowina Sanela
	 */
	 
	/**
	 * Returns the sum of a and b
	 * @param {Number} a
	 * @param {Number} b
	 * @param {Boolean} retArr If set to true, the function will return an array
	 * @returns {Number|Array} Sum of a and b or an array that contains a, b and the sum of a and b.
	 */
	function sum(a, b, retArr) {
		
		// Check if array requested
		if (retArr) {
			
			// Make and return an array
			return [a, b, a + b]; // put everything inside
			
		}
		
		// Return as a number
		return a + b; // calculate sum
		
	}
```

Single line comments can contain additional notes to attract attention to certain problems:

```
// TODO: add validation
const x = value;

// FIXME: sometimes divided by 0
const y = 1 / Date.now() % 0xFFFFFF;

const z = getValue();
// HACK: I wouldn't do that, but now it works
z = (z << 1) - (z >> 1); // z*2 - z/2
```


## Naming

1. Entities (variable, function) start lowercase.
1. Type (class) names start uppercase.
1. Use [СamelCase](https://ru.wikipedia.org/wiki/CamelCase)
1. CamelCase abbreviation by lowercasing all but first letters: *my**Xml**To**Html**Converter*.
1. Constants and macros are in UPPER\_CASE, where '\_' separates the words.



## JS

1. Object literals can be one-line, if there are at most 5 props and the whole
literal is below 60 symbols in length.
	
	```
	const obj1 = {x: 1, y: 2, z: 3, w: 4}; // ok
	const obj2 = {someProperty1: 'my string', someProperty3: 'other string', counter: 1}; // NOT ok
	```

1. Declaring a group of variables, do it multi-line, using keyword on every line.
	
	```
	// NOT GOOD
	const a = 10,
		b = 11,
		c = 12;
	
	// GOOD
	const a = 10;
	const b = 11;
	const c = 12;
	```

1. Use strict equality `===` by default.

1. In class declaration, first properties then methods.

1. Use single-quotes for strings. Use interpolated strings when needed.
	
	```
	const str1 = 'The time is ' + Date.now(); // NOT GOOD
	
	const str2 = `The time is ${Date.now()}`; // GOOD
	```

1. Separate code sections with newlines.

1. Return without round braces.

1. Brace open on the same line, not a new line.

1. Callbacks are named `cb` if there is no solid reason to do otherwise:
	
	```
	function do(cb) {
	
		async.parallel([
			
			cb => cb(),
			
			cb => action(cb),
			
		], cb);
		
	}
	```

1. Promise resolving functions should be named **res**/**rej** or **resolve**/**reject**.
