(function() {
  var Exporter, _ref;

  if ((_ref = window.Webbzeug) == null) {
    window.Webbzeug = {};
  }

  window.Webbzeug.Exporter = Exporter = (function() {

    function Exporter() {}

    Exporter.prototype.actionsToDataURL = function(actions) {
      var action, param, value, _i, _len, _ref1;
      this.output = '';
      this.startStream();
      this.output += '\x02';
      for (_i = 0, _len = actions.length; _i < _len; _i++) {
        action = actions[_i];
        this.output += '\x03';
        this.output += Webbzeug.Utilities.stringToByte(action.type);
        this.output += '\x04';
        this.output += '\x05';
        this.output += action.index;
        this.output += '\x05';
        this.output += action.x;
        this.output += '\x05';
        this.output += action.y;
        this.output += '\x05';
        this.output += action.width;
        this.output += '\x06';
        _ref1 = action.parameters;
        for (param in _ref1) {
          value = _ref1[param];
          this.output += '\x07';
          this.output += Webbzeug.Utilities.stringToByte(param);
          this.output += '\x08';
          this.output += Webbzeug.Utilities.stringToByte(value);
        }
        this.output += '\x00';
      }
      this.debugPrint(this.output);
      return "data:application/octet-stream;base64," + Base64.encode(this.output);
    };

    Exporter.prototype.startStream = function() {
      this.output += 'WZ';
      this.output += '\x01';
      return this.output += Webbzeug.Utilities.versionToInt(Webbzeug.Version);
    };

    Exporter.prototype.debugPrint = function(str) {
      var c, e, h, r;
      r = "";
      e = str.length;
      c = 0;
      while (c < e) {
        h = str.charCodeAt(c++).toString(16);
        while (h.length < 2) {
          h = "0" + h;
        }
        r += " " + h;
      }
      return console.log(str.length, "<Object" + r + ">");
    };

    return Exporter;

  })();

}).call(this);
