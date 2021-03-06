(function() {
  var CustomRandom = function(nseed) {

    var seed,
        constant = Math.pow(2, 13)+1,
        prime = 37,
        maximum = Math.pow(2, 50);

    if (nseed) {
        seed = nseed;
    }

    if (seed == null) {
        seed = (new Date()).getTime();
    }

    return {
        next : function() {
            seed *= constant;
            seed += prime;
            seed %= maximum;

            return seed;
        },
        next01: function() {
          return this.next() / maximum;
        }
    }
};
  var FractalAction, _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (window.Webbzeug == null) {
    window.Webbzeug = {};
  }

  if ((_base = window.Webbzeug).Actions == null) {
    _base.Actions = {};
  }

  window.Webbzeug.Actions.Fractal = FractalAction = (function(_super) {
    __extends(FractalAction, _super);

    function FractalAction() {
      _ref = FractalAction.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    FractalAction.prototype.type = 'fractal';

    FractalAction.prototype.name = 'Fractal';

    FractalAction.prototype.unitSize = 1;

    FractalAction.prototype.availableParameters = function() {
      return {
        roughness: {
          name: 'Roughness',
          type: 'integer',
          min: 1,
          max: 100,
          "default": 3,
          scrollPrecision: 1
        },
        seed: {
          name: 'Seed',
          type: 'integer',
          min: 1,
          max: 255,
          "default": Math.round(Math.random() * 255),
          scrollPrecision: 1
        }
      };
    };

    FractalAction.prototype.validations = function(contexts) {
      var warnings;
      warnings = [];
      if (contexts.length > 1) {
        warnings.push('Fractal will only use the first input.');
      }
      return {
        warnings: warnings
      };
    };

    FractalAction.prototype.render = function(inputs) {
      var fractalTexture;
      FractalAction.__super__.render.call(this);
      if (this.canvas == null) {
        this.createCanvas();
      }
      this.createPatternOnCanvas();
      fractalTexture = new THREE.Texture(this.canvas);
      fractalTexture.needsUpdate = true;
      this.fractalMaterial = new THREE.MeshBasicMaterial({
        map: fractalTexture
      });
      this.screenAlignedQuadMesh.material = this.fractalMaterial;
      this.app.renderer.render(this.renderToTextureScene, this.app.renderToTextureCamera, this.renderTarget, true);
      return this.renderTarget;
    };

    FractalAction.prototype.createPatternOnCanvas = function() {
      var center, color, h, imageData, imagePixelData, index, ll, lr, map, roughness, ul, ur, w, x, y, _i, _j, _k, _ref1, _ref2, _ref3;
      this.rnd = CustomRandom(this.getParameter('seed'));
      roughness = this.getParameter('roughness') / this.app.getWidth();
      imageData = this.context.getImageData(0, 0, this.app.getWidth(), this.app.getHeight());
      imagePixelData = imageData.data;
      w = this.app.getWidth();
      h = this.app.getHeight();
      map = [];
      for (x = _i = 0, _ref1 = w + 1; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; x = 0 <= _ref1 ? ++_i : --_i) {
        map[x] = [];
      }
      map[0][0] = this.rnd.next01();
      ul = map[0][0];
      map[0][h] = this.rnd.next01();
      ll = map[0][h];
      map[w][0] = this.rnd.next01();
      ur = map[w][0];
      map[w][h] = this.rnd.next01();
      lr = map[w][h];
      map[w / 2][h / 2] = ul + ll + ur + lr;
      map[w / 2][h / 2] = this.normalize(map[w / 2][h / 2]);
      center = map[w / 2][h / 2];
      map[w / 2][h] = ll + lr + center / 3;
      map[w / 2][0] = ul + ur + center / 3;
      map[w][h / 2] = ur + lr + center / 3;
      map[0][h / 2] = ul + ll + center / 3;
      map = this.midpointDisplacement(this.app.getWidth(), map);
      for (x = _j = 0, _ref2 = this.app.getWidth(); 0 <= _ref2 ? _j < _ref2 : _j > _ref2; x = 0 <= _ref2 ? ++_j : --_j) {
        for (y = _k = 0, _ref3 = this.app.getHeight(); 0 <= _ref3 ? _k < _ref3 : _k > _ref3; y = 0 <= _ref3 ? ++_k : --_k) {
          color = Math.floor(map[x][y] * 250);
          index = ((y * this.app.getWidth()) << 2) + (x << 2);
          imagePixelData[index] = color;
          imagePixelData[index + 1] = color;
          imagePixelData[index + 2] = color;
          imagePixelData[index + 3] = 255;
        }
      }
      this.context.putImageData(imageData, 0, 0);
      return this.context;
    };

    FractalAction.prototype.midpointDisplacement = function(dimension, map) {
      var bl, br, center, i, j, newDimension, tl, tr, x, y, _i, _j, _ref1, _ref2;
      newDimension = dimension / 2;
      if (newDimension > this.unitSize) {
        for (i = _i = newDimension, _ref1 = this.app.getWidth(); newDimension > 0 ? _i <= _ref1 : _i >= _ref1; i = _i += newDimension) {
          for (j = _j = newDimension, _ref2 = this.app.getWidth(); newDimension > 0 ? _j <= _ref2 : _j >= _ref2; j = _j += newDimension) {
            x = i - (newDimension / 2);
            y = j - (newDimension / 2);
            tl = map[i - newDimension][j - newDimension];
            tr = map[i][j - newDimension];
            bl = map[i - newDimension][j];
            br = map[i][j];
            map[x][y] = (tl + tr + bl + br) / 4 + this.displace(dimension);
            map[x][y] = this.normalize(map[x][y]);
            center = map[x][y];
            if (j - (newDimension * 2) + (newDimension / 2) > 0) {
              map[x][j - newDimension] = (tl + tr + center + map[x][j - dimension + (newDimension / 2)]) / 4 + this.displace(dimension);
            } else {
              map[x][j - newDimension] = (tl + tr + center) / 3 + this.displace(dimension);
            }
            if (j + (newDimension / 2) < this.app.getWidth()) {
              map[x][j] = (bl + br + center + map[x][j + (newDimension / 2)]) / 4 + this.displace(dimension);
            } else {
              map[x][j] = (bl + br + center) / 3 + this.displace(dimension);
            }
            map[x][j] = this.normalize(map[x][j]);
            if (i + (newDimension / 2) < this.app.getWidth()) {
              map[i][y] = (tr + br + center + map[i + (newDimension / 2)][y]) / 4 + this.displace(dimension);
            } else {
              map[i][y] = (tr + br + center) / 3 + this.displace(dimension);
            }
            map[i][y] = this.normalize(map[i][y]);
            if (i - (newDimension * 2) + (newDimension / 2) > 0) {
              map[i - newDimension][y] = (tl + bl + center + map[i - dimension + (newDimension / 2)][y]) / 4 + this.displace(dimension);
            } else {
              map[i - newDimension][y] = (tl + bl + center) / 3 + this.displace(dimension);
            }
            map[i - newDimension][y] = this.normalize(map[i - newDimension][y]);
          }
        }
        map = this.midpointDisplacement(newDimension, map);
      }
      return map;
    };

    FractalAction.prototype.normalize = function(value) {
      value = Math.max(0, value);
      value = Math.min(1, value);
      return value;
    };

    FractalAction.prototype.displace = function(num) {
      var max;
      max = num / (this.app.getWidth() * 2) * this.getParameter('roughness');
      return (this.rnd.next01() - 0.5) * max;
    };

    return FractalAction;

  })(Webbzeug.Action);

}).call(this);
