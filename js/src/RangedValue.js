var Factory, Interpolation, Listenable, NativeValue, Reaction, ReactiveGetter, emptyFunction;

NativeValue = require("component").NativeValue;

ReactiveGetter = require("ReactiveGetter");

Interpolation = require("Interpolation");

emptyFunction = require("emptyFunction");

Listenable = require("listenable");

Reaction = require("reaction");

Factory = require("factory");

module.exports = Factory("RangedValue", {
  kind: NativeValue,
  create: function() {
    return {};
  },
  optionTypes: {
    value: [NativeValue, Number, Void],
    reaction: [Reaction, Void],
    get: [Function, Void],
    didSet: [Function, Void],
    range: Array,
    dampen: [Array, Void]
  },
  optionDefaults: {
    dampen: [0, 0],
    didSet: emptyFunction
  },
  customValues: {
    value: {
      get: function() {
        return this._reaction.value;
      }
    },
    minValue: {
      get: function() {
        return this.range[0];
      },
      set: function(minValue) {
        return this.range[0] = minValue;
      }
    },
    maxValue: {
      get: function() {
        return this.range[1];
      },
      set: function(maxValue) {
        return this.range[1] = maxValue;
      }
    },
    getValue: {
      lazy: function() {
        return (function(_this) {
          return function() {
            return _this.value;
          };
        })(this);
      }
    },
    dampen: {
      value: null,
      didSet: function(dampen) {
        return this._dampen = this._createDampener();
      }
    }
  },
  initValues: function(options) {
    return {
      range: options.range,
      reaction: options.reaction,
      nativeValue: options.value != null ? NativeValue(options.value) : void 0,
      _get: options.get,
      _didSet: options.didSet,
      _reaction: null,
      _dampen: null
    };
  },
  init: function(options) {
    Listenable(this, {
      eventNames: true
    });
    this.dampen = options.dampen;
    if (this._get != null) {

    } else if (this.nativeValue != null) {
      this._get = this.nativeValue.getValue;
    } else if (this.reaction != null) {
      this._get = (function(_this) {
        return function() {
          return _this.reaction.value;
        };
      })(this);
    }
    return this._reaction = Reaction.sync({
      get: (function(_this) {
        return function() {
          var value;
          value = _this._get();
          if (value != null) {
            return _this._dampen(value);
          } else {
            return null;
          }
        };
      })(this),
      didSet: (function(_this) {
        return function(newValue, oldValue) {
          _this._didSet(newValue, oldValue);
          return _this._emit("didSet", newValue);
        };
      })(this)
    });
  },
  getProgress: function(arg) {
    var clamp, progress;
    clamp = (arg != null ? arg : {}).clamp;
    progress = (this.value - this.minValue) / (this.maxValue - this.minValue);
    if (!clamp) {
      return progress;
    }
    return Math.max(0, Math.min(1, progress));
  },
  detach: function() {},
  _createDampener: function() {
    var max, min, ref;
    ref = this.dampen, min = ref[0], max = ref[1];
    return Interpolation.create({
      inputRange: [this.minValue - 10, this.minValue, this.maxValue, this.maxValue + 10],
      outputRange: [this.minValue - (min === 0 ? 0 : Math.pow(10, min)), this.minValue, this.maxValue, this.maxValue + (max === 0 ? 0 : Math.pow(10, max))]
    });
  }
});

//# sourceMappingURL=../../map/src/RangedValue.map
