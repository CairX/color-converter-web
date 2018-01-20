/* exported ColorUtils */

"use strict";

var ColorUtils = (function() {
	var self = {};

	var splitInterval = function(string, interval) {
		return string.toString().match(new RegExp(".{1," + interval + "}", "g"));
	};

	var padding = function(number) {
		if (number.toString().length === 1) {
			return "0" + number.toString();
		}
		return number;
	};

	self.formats = [
		{
			id: "rgb",
			pattern: /rgb\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)/i,
			weight: 0,
			extract: function(string) {
				var values = this.pattern.exec(string).map(Number);
				return { red: values[1], green: values[2], blue: values[3], alpha: 255 };
			},
			string: function(raw) {
				return "rgb(" + raw.red + ", " + raw.green + ", " + raw.blue + ")";
			}
		}, {
			id: "rgba",
			pattern: /rgba\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3}),\s?([+-]?(\d*[.])?\d+)\)/i,
			weight: 1,
			extract: function(string) {
				var values = this.pattern.exec(string).map(Number);
				return { red: values[1], green: values[2], blue: values[3], alpha: values[4] * 255 };
			},
			string: function(raw) {
				return "rgba(" + raw.red + ", " + raw.green + ", " + raw.blue + ", " + (raw.alpha / 255).toFixed(3) + ")";
			}
		}, {
			id: "hex-36",
			pattern: /^#([0-9a-f]{3}|[0-9a-f]{6})$/im,
			weight: 0,
			extract: function(string) {
				var values = this.pattern.exec(string)[1];
				if (values.length === 3) {
					values = splitInterval(values, 1).map(function(value) {
						return value + value;
					});
				} else if (values.length === 6) {
					values = splitInterval(values, 2);
				}
				values = values.map(function(value) {
					return parseInt(value, 16);
				});
				return { red: values[0], green: values[1], blue: values[2], alpha: 255 };
			},
			string: function(raw) {
				Object.keys(raw).forEach(function(key) {
					raw[key] = padding(raw[key].toString(16));
				});
				var value = "#" + raw.red + "" + raw.green + "" + raw.blue;
				if (raw.alpha !== "ff") {
					value += raw.alpha;
				}
				return value;
			}
		}, {
			id: "hex-48",
			pattern: /^#([0-9a-f]{4}|[0-9a-f]{8})$/im,
			weight: 1,
			extract: function(string) {
				var values = this.pattern.exec(string)[1];
				if (values.length === 4) {
					values = splitInterval(values, 1).map(function(value) {
						return value + value;
					});
				} else if (values.length === 8) {
					values = splitInterval(values, 2);
				}
				values = values.map(function(value) {
					return parseInt(value, 16);
				});
				return { red: values[0], green: values[1], blue: values[2], alpha: values[3] };
			},
			string: function(raw) {
				Object.keys(raw).forEach(function(key) {
					raw[key] = padding(raw[key].toString(16));
				});
				var value = "#" + raw.red + "" + raw.green + "" + raw.blue;
				if (raw.alpha !== "ff") {
					value += raw.alpha;
				}
				return value;
			}
		}
	];

	self.format = function(string) {
		for (var i = 0; i < self.formats.length; i++) {
			var format = self.formats[i];
			if (format.pattern.test(string)) {
				return { raw: format.extract(string), format: format };
			}
		}
		return null;
	};

	return self;
})();
