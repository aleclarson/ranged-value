
{ NativeValue } = require "component"

ReactiveGetter = require "ReactiveGetter"
Interpolation = require "Interpolation"
emptyFunction = require "emptyFunction"
Listenable = require "listenable"
Reaction = require "reaction"
Factory = require "factory"

module.exports = Factory "RangedValue",

  kind: NativeValue

  create: -> {} # Pretending to inherit from NativeValue.

  optionTypes:
    value: [ NativeValue, Number, Void ]
    reaction: [ Reaction, Void ]
    get: [ Function, Void ]
    didSet: [ Function, Void ]
    range: Array
    dampen: [ Array, Void ]

  optionDefaults:
    dampen: [ 0, 0 ]
    didSet: emptyFunction

  customValues:

    value: get: ->
      @_reaction.value

    minValue:
      get: -> @range[0]
      set: (minValue) ->
        @range[0] = minValue

    maxValue:
      get: -> @range[1]
      set: (maxValue) ->
        @range[1] = maxValue

    # Matches the NativeValue API.
    getValue: lazy: ->
      return => @value

    dampen:
      value: null
      didSet: (dampen) ->
        @_dampen = @_createDampener()

  initValues: (options) ->
    range: options.range
    reaction: options.reaction
    nativeValue: NativeValue options.value if options.value?
    _get: options.get
    _didSet: options.didSet
    _reaction: null
    _dampen: null

  init: (options) ->

    Listenable this, { eventNames: yes }

    @dampen = options.dampen

    if @_get?
      # no-op
    else if @nativeValue?
      @_get = @nativeValue.getValue
    else if @reaction?
      @_get = => @reaction.value

    @_reaction = Reaction.sync
      get: =>
        value = @_get()
        if value? then @_dampen value
        else null
      didSet: (newValue, oldValue) =>
        @_didSet newValue, oldValue
        @_emit "didSet", newValue

  getProgress: ({ clamp } = {}) ->
    progress = (@value - @minValue) / (@maxValue - @minValue)
    return progress unless clamp
    Math.max 0, Math.min 1, progress

  # Matches the NativeValue API.
  detach: ->
    # TODO Remove reaction?

  _createDampener: ->

    [ min, max] = @dampen

    return Interpolation.create

      inputRange: [
        @minValue - 10
        @minValue
        @maxValue
        @maxValue + 10
      ]

      outputRange: [
        @minValue - if min is 0 then 0 else Math.pow 10, min
        @minValue
        @maxValue
        @maxValue + if max is 0 then 0 else Math.pow 10, max
      ]
