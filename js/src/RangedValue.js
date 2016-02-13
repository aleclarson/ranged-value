var Factory, Interpolation, Listenable, NativeValue, Reaction, ReactiveGetter, emptyFunction;

NativeValue = require("component").NativeValue;

ReactiveGetter = require("reactive-getter");

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
    get: Function,
    range: Array,
    dampen: Array,
    didSet: Function
  },
  optionDefaults: {
    dampen: [0, 0],
    didSet: emptyFunction
  },
  customValues: {
    minValue: {
      get: function() {
        return this._range[0];
      }
    },
    maxValue: {
      get: function() {
        return this._range[1];
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
    }
  },
  initFrozenValues: function(options) {
    return {
      _get: ReactiveGetter(options.get),
      _didSet: options.didSet,
      _range: options.range,
      _dampen: this._createDampener(options.dampen)
    };
  },
  initReactiveValues: function(options) {
    return {
      value: Reaction.sync({
        get: (function(_this) {
          return function() {
            return _this._dampen(_this._get());
          };
        })(this),
        didSet: (function(_this) {
          return function(newValue) {
            _this._didSet(newValue);
            return _this._emit("didSet", newValue);
          };
        })(this)
      })
    };
  },
  init: function() {
    return Listenable(this);
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
  _createDampener: function(dampenValues) {
    return Interpolation.create({
      inputRange: [this.minOffset - 10, this.minOffset, this.maxOffset, this.maxOffset + 10],
      outputRange: [this.minOffset - (dampenValues[0] === 0 ? 0 : Math.pow(10, dampenValues[0])), this.minOffset, this.maxOffset, this.maxOffset + (dampenValues[1] === 0 ? 0 : Math.pow(10, dampenValues[1]))]
    });
  }
});

//# sourceMappingURL=../../map/src/RangedValue.map
