
{ NativeValue } = require "component"

ReactiveGetter = require "reactive-getter"
Interpolation = require "Interpolation"
emptyFunction = require "emptyFunction"
Listenable = require "listenable"
Reaction = require "reaction"
Factory = require "factory"

module.exports = Factory "RangedValue",

  kind: NativeValue

  create: -> {} # Pretending to inherit from NativeValue.

  optionTypes:
    get: Function
    range: Array
    dampen: Array
    didSet: Function

  optionDefaults:
    dampen: [ 0, 0 ]
    didSet: emptyFunction

  customValues:

    minValue: get: ->
      @_range[0]

    maxValue: get: ->
      @_range[1]

    getValue: lazy: ->
      return => @value

  initFrozenValues: (options) ->
    _get: ReactiveGetter options.get
    _didSet: options.didSet
    _range: options.range
    _dampen: @_createDampener options.dampen

  initReactiveValues: (options) ->

    value: Reaction.sync
      get: => @_dampen @_get()
      didSet: (newValue) =>
        @_didSet newValue
        @_emit "didSet", newValue

  init: ->

    Listenable this

  getProgress: ({ clamp } = {}) ->
    progress = (@value - @minValue) / (@maxValue - @minValue)
    return progress unless clamp
    Math.max 0, Math.min 1, progress

  detach: ->
    # TODO Remove reaction?

  _createDampener: (dampenValues) ->

    return Interpolation.create

      inputRange: [
        @minOffset - 10
        @minOffset
        @maxOffset
        @maxOffset + 10
      ]

      outputRange: [
        @minOffset - if dampenValues[0] is 0 then 0 else Math.pow 10, dampenValues[0]
        @minOffset
        @maxOffset
        @maxOffset + if dampenValues[1] is 0 then 0 else Math.pow 10, dampenValues[1]
      ]
