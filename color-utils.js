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

	// -------------------------------- //
	// Internal format of:
	// raw[ red, green, blue, alpha ]
	// Normalized values (0 to 1).
	// -------------------------------- //
	self.formats = [
		{
			id: "rgb",
			pattern: /^rgb\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/i,
			weight: 0,
			extract: function(string) {
				var values = this.pattern.exec(string);
				values.shift();
				values = values.map(function(value) { return Number(value) / 255; });
				values.push(1.0);
				return values;
			},
			string: function(raw) {
				raw = raw.slice(0, 3);
				raw = raw.map(function(value) { return Math.round(value * 255); });
				return "rgb(" + raw.join(", ") +  ")";
			}
		}, {
			id: "rgba",
			pattern: /^rgba\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3}),\s?([0][.]\d+|[.]\d+|[01]|[1][.][0]+)\)$/i,
			weight: 1,
			extract: function(string) {
				var values = this.pattern.exec(string);
				values.shift();
				values = values.map(Number);
				var alpha = values.pop();
				values = values.map(function(value) { return value / 255; });
				values.push(alpha);
				return values;
			},
			string: function(raw) {
				var colors = raw.slice(0, 3);
				colors = colors.map(function(value) { return Math.round(value * 255); });
				return "rgba(" + colors.join(", ") + ", " + raw[3].toFixed(3) + ")";
			}
		}, {
			id: "hex-36",
			pattern: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i,
			weight: 0,
			extract: function(string) {
				var values = this.pattern.exec(string)[1];
				if (values.length === 3) {
					values = splitInterval(values, 1);
					values = values.map(function(value) { return value + value; });
				} else if (values.length === 6) {
					values = splitInterval(values, 2);
				}
				values = values.map(function(value) {
					return Number.parseInt(value, 16) / 255;
				});
				values.push(1.0);
				return values;
			},
			string: function(raw) {
				raw = raw.map(function(value) {
					return padding(Math.round(value * 255).toString(16));
				});
				raw.pop();
				return "#" + raw.join("");
			}
		}, {
			id: "hex-48",
			pattern: /^#([0-9a-f]{4}|[0-9a-f]{8})$/i,
			weight: 1,
			extract: function(string) {
				var values = this.pattern.exec(string)[1];
				if (values.length === 4) {
					values = splitInterval(values, 1);
					values = values.map(function(value) { return value + value; });
				} else if (values.length === 8) {
					values = splitInterval(values, 2);
				}
				values = values.map(function(value) {
					return Number.parseInt(value, 16) / 255;
				});
				return values;
			},
			string: function(raw) {
				raw = raw.map(function(value) {
					return padding(Math.round(value * 255).toString(16));
				});
				return "#" + raw.join("");
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
