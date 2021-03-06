"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

;(function (root) {

	var previousGlobalize = root.uship.Globalize;
	var Globalize = function Globalize(cultureSelector) {
		return new Globalize.prototype.init(cultureSelector);
	};

	if (typeof require !== "undefined" && typeof exports !== "undefined" && typeof module !== "undefined") {
		module.exports = Globalize;
	} else {
		root.uship.Globalize = Globalize;
	}

	Globalize.noConflict = function () {
		root.uship.Globalize = previousGlobalize;
		return this;
	};

	Globalize.cultures = {};

	Globalize.prototype = {
		constructor: Globalize,
		init: function init(cultureSelector) {
			this.cultures = Globalize.cultures;
			this.cultureSelector = cultureSelector;

			return this;
		}
	};

	Globalize.prototype.init.prototype = Globalize.prototype;

	Globalize.prototype.findClosestCulture = function (cultureSelector) {
		return Globalize.findClosestCulture.call(this, cultureSelector);
	};

	Globalize.prototype.format = function (value, format, cultureSelector) {
		return Globalize.format.call(this, value, format, cultureSelector);
	};

	Globalize.prototype.localize = function (key, cultureSelector) {
		return Globalize.localize.call(this, key, cultureSelector);
	};

	Globalize.prototype.localizeToDefaultCulture = function (key /*, ...replacements*/) {
		return Globalize.localizeToDefaultCulture.apply(this, arguments);
	};

	//Convenience alias
	Globalize.prototype.loc = Globalize.prototype.localizeToDefaultCulture;

	Globalize.prototype.parseInt = function (value, radix, cultureSelector) {
		return Globalize.parseInt.call(this, value, radix, cultureSelector);
	};

	Globalize.prototype.parseFloat = function (value, radix, cultureSelector) {
		return Globalize.parseFloat.call(this, value, radix, cultureSelector);
	};

	Globalize.prototype.culture = function (cultureSelector) {
		return Globalize.culture.call(this, cultureSelector);
	};

	//Utility functions, will need to be implemented separately to be used without jQuery
	var utils = root.uship.utils;
	Globalize.extend = root.jQuery.extend;
	Globalize.isArray = utils.isArray;

	Globalize.addCultureInfo = function (cultureName, baseCultureName, info) {
		var base = {};
		var isNew = false;

		if (typeof cultureName !== "string") {
			info = cultureName;
			cultureName = this.culture().name;
			base = this.cultures[cultureName];
		} else if (typeof baseCultureName !== "string") {
			info = baseCultureName;
			isNew = this.cultures[cultureName] == null;
			base = this.cultures[cultureName] || this.cultures["default"];
		} else {
			isNew = true;
			base = this.cultures[baseCultureName];
		}

		this.cultures[cultureName] = Globalize.extend(true, {}, base, info);

		if (isNew) {
			this.cultures[cultureName].calendar = this.cultures[cultureName].calendars.standard;
		}
	};

	Globalize.findClosestCulture = function (name) {
		var match;
		if (!name) {
			return this.findClosestCulture(this.cultureSelector) || this.cultures["default"];
		}

		if (Globalize.isArray(name) || name.split(',').length > 1) {
			throw new Error("uShip's implementation of Globalize does not currently support passing in either an array or a comma-separated list of cultures");
		}

		//Exact match
		match = this.cultures[name];
		if (match) {
			return match;
		}

		//Neutral language match
		do {
			var index = name.lastIndexOf("-");
			if (index === -1) {
				break;
			}
			// strip off the last part. e.g. en-US => en
			name = name.substr(0, index);
			match = this.cultures[name];
			if (match) {
				return match;
			}
		} while (1);

		// last resort: match first culture using that language
		for (var cultureKey in this.cultures) {
			var culture = this.cultures[cultureKey];
			if (culture.language === name) {
				return culture;
			}
		}

		if ((typeof name === "undefined" ? "undefined" : _typeof(name)) === "object") {
			return name;
		}
		return match || null;
	};

	Globalize.format = function (value, format, cultureSelector) {
		var culture = this.findClosestCulture(cultureSelector);
		if (value instanceof Date) {
			value = formatDate(value, format, culture);
		} else if (typeof value === "number") {
			//value = formatNumber( value, format, culture );
		}
		return value;
	};

	Globalize.localize = function (key, cultureSelector) {
		key = key ? key.toUpperCase() : '';
		return this.findClosestCulture(cultureSelector).messages[key] || this.cultures["default"].messages[key] || "";
	};

	Globalize.localizeToDefaultCulture = function (key /*, ...replacements*/) {
		var localized = this.localize(key);
		return arguments.length > 1 ? utils.format.apply(null, [localized].concat(utils.toArray(arguments, 1))) : localized;
	};

	Globalize.loc = Globalize.localizeToDefaultCulture;

	Globalize.culture = function (cultureSelector) {
		if (typeof cultureSelector !== "undefined") {
			this.cultureSelector = cultureSelector;
		}

		return this.findClosestCulture(cultureSelector) || this.cultures["default"];
	};

	Globalize.cultures["default"] = {
		name: "en",
		englishName: "English",
		nativeName: "English",
		isRTL: false,
		language: "en",
		numberFormat: {
			pattern: ["-n"],
			decimals: 2,
			",": ",",
			".": ".",
			groupSizes: [3],
			"+": "+",
			"-": "-",
			"NaN": "NaN",
			negativeInfinity: "-Infinity",
			positiveInfinity: "Infinity",
			percent: {
				pattern: ["-n %", "n %"],
				decimals: 2,
				groupSizes: [3],
				",": ",",
				".": ".",
				symbol: "%"
			},
			currency: {
				pattern: ["($n)", "$n"],
				decimals: 2,
				groupSizes: [3],
				",": ",",
				".": ".",
				symbol: "$"
			}
		},
		calendars: {
			standard: {
				name: "Gregorian_USEnglish",
				"/": "/",
				":": ":",
				firstDay: 0,
				days: {
					names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
					namesAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
					namesShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
				},
				months: {
					names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""],
					namesAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""]
				},
				AM: ["AM", "am", "AM"],
				PM: ["PM", "pm", "PM"],
				eras: [{
					"name": "A.D.",
					"start": null,
					"offset": 0
				}],
				twoDigitYearMax: 2029,
				patterns: {
					d: "M/d/yyyy",
					D: "dddd, MMMM dd, yyyy",
					t: "h:mm tt",
					T: "h:mm:ss tt",
					f: "dddd, MMMM dd, yyyy h:mm tt",
					F: "dddd, MMMM dd, yyyy h:mm:ss tt",
					M: "MMMM dd",
					Y: "yyyy MMMM",
					S: "yyyy'-'MM'-'dd'T'HH':'mm':'ss"
				}
			}
		},
		messages: {}
	};

	Globalize.cultures["default"].calendar = Globalize.cultures["default"].calendars.standard;
	Globalize.cultures.en = Globalize.cultures["default"];
	Globalize.cultureSelector = "en";

	//Set up a convenience method in the root namespace
	utils.extend(root.uship, {
		loc: function loc(key /*, ...replacements */) {
			return root.uship.Globalize.localizeToDefaultCulture.apply(root.uship.Globalize, arguments);
		},
		globalize: Globalize
	});

	var appendPreOrPostMatch = function appendPreOrPostMatch(preMatch, strings) {
		// appends pre- and post- token match strings while removing escaped characters.
		// Returns a single quote count which is used to determine if the token occurs
		// in a string literal.
		var quoteCount = 0,
		    escaped = false;
		for (var i = 0, il = preMatch.length; i < il; i++) {
			var c = preMatch.charAt(i);
			switch (c) {
				case "\'":
					if (escaped) {
						strings.push("\'");
					} else {
						quoteCount++;
					}
					escaped = false;
					break;
				case "\\":
					if (escaped) {
						strings.push("\\");
					}
					escaped = !escaped;
					break;
				default:
					strings.push(c);
					escaped = false;
					break;
			}
		}
		return quoteCount;
	};

	var getTokenRegExp = function getTokenRegExp() {
		// regular expression for matching date and time tokens in format strings.
		return (/\/|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|zzz|zz|z|gg|g/g
		);
	};

	var getEra = function getEra(date, eras) {
		if (!eras) return 0;
		var start,
		    ticks = date.getTime();
		for (var i = 0, l = eras.length; i < l; i++) {
			start = eras[i].start;
			if (start === null || ticks >= start) {
				return i;
			}
		}
		return 0;
	};

	var getEraYear = function getEraYear(date, cal, era, sortable) {
		var year = date.getFullYear();
		if (!sortable && cal.eras) {
			// convert normal gregorian year to era-shifted gregorian
			// year by subtracting the era offset
			year -= cal.eras[era].offset;
		}
		return year;
	};

	var expandFormat = function expandFormat(cal, format) {
		// expands unspecified or single character date formats into the full pattern.
		format = format || "F";
		var pattern,
		    patterns = cal.patterns,
		    len = format.length;
		if (len === 1) {
			pattern = patterns[format];
			if (!pattern) {
				throw "Invalid date format string \'" + format + "\'.";
			}
			format = pattern;
		} else if (len === 2 && format.charAt(0) === "%") {
			// %X escape format -- intended as a custom format string that is only one character, not a built-in format.
			format = format.charAt(1);
		}
		return format;
	};

	var formatDate = function formatDate(value, format, culture) {
		var cal = culture.calendar,
		    convert = cal.convert,
		    ret;

		if (!format || !format.length || format === "i") {
			if (culture && culture.name.length) {
				if (convert) {
					// non-gregorian calendar, so we cannot use built-in toLocaleString()
					ret = formatDate(value, cal.patterns.F, culture);
				} else {
					var eraDate = new Date(value.getTime()),
					    era = getEra(value, cal.eras);
					eraDate.setFullYear(getEraYear(value, cal, era));
					ret = eraDate.toLocaleString();
				}
			} else {
				ret = value.toString();
			}
			return ret;
		}

		var eras = cal.eras,
		    sortable = format === "s";
		format = expandFormat(cal, format);

		// Start with an empty string
		ret = [];
		var hour,
		    zeros = ["0", "00", "000"],
		    foundDay,
		    checkedDay,
		    dayPartRegExp = /([^d]|^)(d|dd)([^d]|$)/g,
		    quoteCount = 0,
		    tokenRegExp = getTokenRegExp(),
		    converted;

		function padZeros(num, c) {
			var r,
			    s = num + "";
			if (c > 1 && s.length < c) {
				r = zeros[c - 2] + s;
				return r.substr(r.length - c, c);
			} else {
				r = s;
			}
			return r;
		}

		function hasDay() {
			if (foundDay || checkedDay) {
				return foundDay;
			}
			foundDay = dayPartRegExp.test(format);
			checkedDay = true;
			return foundDay;
		}

		function getPart(date, part) {
			if (converted) {
				return converted[part];
			}
			switch (part) {
				case 0:
					return date.getFullYear();
				case 1:
					return date.getMonth();
				case 2:
					return date.getDate();
				default:
					throw "Invalid part value " + part;
			}
		}

		if (!sortable && convert) {
			converted = convert.fromGregorian(value);
		}

		for (;;) {
			// Save the current index
			var index = tokenRegExp.lastIndex,

			// Look for the next pattern
			ar = tokenRegExp.exec(format);

			// Append the text before the pattern (or the end of the string if not found)
			var preMatch = format.slice(index, ar ? ar.index : format.length);
			quoteCount += appendPreOrPostMatch(preMatch, ret);

			if (!ar) {
				break;
			}

			// do not replace any matches that occur inside a string literal.
			if (quoteCount % 2) {
				ret.push(ar[0]);
				continue;
			}

			var current = ar[0],
			    clength = current.length;

			switch (current) {
				case "ddd":
				//Day of the week, as a three-letter abbreviation
				case "dddd":
					// Day of the week, using the full name
					var names = clength === 3 ? cal.days.namesAbbr : cal.days.names;
					ret.push(names[value.getDay()]);
					break;
				case "d":
				// Day of month, without leading zero for single-digit days
				case "dd":
					// Day of month, with leading zero for single-digit days
					foundDay = true;
					ret.push(padZeros(getPart(value, 2), clength));
					break;
				case "MMM":
				// Month, as a three-letter abbreviation
				case "MMMM":
					// Month, using the full name
					var part = getPart(value, 1);
					ret.push(cal.monthsGenitive && hasDay() ? cal.monthsGenitive[clength === 3 ? "namesAbbr" : "names"][part] : cal.months[clength === 3 ? "namesAbbr" : "names"][part]);
					break;
				case "M":
				// Month, as digits, with no leading zero for single-digit months
				case "MM":
					// Month, as digits, with leading zero for single-digit months
					ret.push(padZeros(getPart(value, 1) + 1, clength));
					break;
				case "y":
				// Year, as two digits, but with no leading zero for years less than 10
				case "yy":
				// Year, as two digits, with leading zero for years less than 10
				case "yyyy":
					// Year represented by four full digits
					part = converted ? converted[0] : getEraYear(value, cal, getEra(value, eras), sortable);
					if (clength < 4) {
						part = part % 100;
					}
					ret.push(padZeros(part, clength));
					break;
				case "h":
				// Hours with no leading zero for single-digit hours, using 12-hour clock
				case "hh":
					// Hours with leading zero for single-digit hours, using 12-hour clock
					hour = value.getHours() % 12;
					if (hour === 0) hour = 12;
					ret.push(padZeros(hour, clength));
					break;
				case "H":
				// Hours with no leading zero for single-digit hours, using 24-hour clock
				case "HH":
					// Hours with leading zero for single-digit hours, using 24-hour clock
					ret.push(padZeros(value.getHours(), clength));
					break;
				case "m":
				// Minutes with no leading zero for single-digit minutes
				case "mm":
					// Minutes with leading zero for single-digit minutes
					ret.push(padZeros(value.getMinutes(), clength));
					break;
				case "s":
				// Seconds with no leading zero for single-digit seconds
				case "ss":
					// Seconds with leading zero for single-digit seconds
					ret.push(padZeros(value.getSeconds(), clength));
					break;
				case "t":
				// One character am/pm indicator ("a" or "p")
				case "tt":
					// Multicharacter am/pm indicator
					part = value.getHours() < 12 ? cal.AM ? cal.AM[0] : " " : cal.PM ? cal.PM[0] : " ";
					ret.push(clength === 1 ? part.charAt(0) : part);
					break;
				case "f":
				// Deciseconds
				case "ff":
				// Centiseconds
				case "fff":
					// Milliseconds
					ret.push(padZeros(value.getMilliseconds(), 3).substr(0, clength));
					break;
				case "z":
				// Time zone offset, no leading zero
				case "zz":
					// Time zone offset with leading zero
					hour = value.getTimezoneOffset() / 60;
					ret.push((hour <= 0 ? "+" : "-") + padZeros(Math.floor(Math.abs(hour)), clength));
					break;
				case "zzz":
					// Time zone offset with leading zero
					hour = value.getTimezoneOffset() / 60;
					ret.push((hour <= 0 ? "+" : "-") + padZeros(Math.floor(Math.abs(hour)), 2) +
					// Hard coded ":" separator, rather than using cal.TimeSeparator
					// Repeated here for consistency, plus ":" was already assumed in date parsing.
					":" + padZeros(Math.abs(value.getTimezoneOffset() % 60), 2));
					break;
				case "g":
				case "gg":
					if (cal.eras) {
						ret.push(cal.eras[getEra(value, eras)].name);
					}
					break;
				case "/":
					ret.push(cal["/"]);
					break;
				default:
					throw "Invalid date format pattern \'" + current + "\'.";
			}
		}
		return ret.join("");
	};
})(window);