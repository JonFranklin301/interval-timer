(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.intervalTimer = {}));
}(this, function (exports) { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var events = typeof module !== 'undefined' && module.exports && typeof require === 'function' ? require('events') : undefined;

  function hasDOM() {
    return typeof document !== 'undefined';
  }

  function hasEventEmitter() {
    return events;
  }
  /**
   * Pad a string
   * @param {string} pad        - String to us as a padding
   * @param {string} string     - String to be padded
   * @param {boolean} padLeft   - Pad from left to right or right to left
   *
   * @example pad('000', 1, true) -> 001
   * @example pad('000', 1, false) -> 100
   */


  function pad(pad, string, padLeft) {
    if (typeof string === 'undefined') return pad;

    if (padLeft) {
      return (pad + string).slice(-pad.length);
    } else {
      return (string + pad).substring(0, pad.length);
    }
  }
  /**
   * Creates an instance of a Timer
   *
   * @class
   */

  var Timer =
  /*#__PURE__*/
  function () {
    /**
     * @constructor
     * @param {object}  [options]                       - User defined options
     * @param {number}  [options.startTime=0]           - Start time in milliseconds
     * @param {number}  [options.endTime=null]          - End time in milliseconds || null for infinite
     * @param {number}  [options.updateFrequency=100]   - The frequency to update the timer
     * @param {boolean} [options.selfAdjust=true]       - Calculate the compensate for Timer drift by adjusting the updateFrequency
     * @param {boolean} [options.countdown=false]       - Countdown - Timer stops at 0 if endTime is not defined or negative
     * @param {boolean} [options.animationFrame=false]  - Use the browser window refresh rate as the Timer updateFrequncy - overwrites the updateFrequency setting
     */
    function Timer(options) {
      _classCallCheck(this, Timer);

      this.startTime = 0;
      this.endTime = null;
      this.updateFrequency = 100;
      this.selfAdjust = true;
      this.countdown = false;
      this.animationFrame = false;
      this._timer;
      this._startTime = 0;
      this._timeAtStart = 0;
      this._currentTime = 0;
      this._expected = 0;
      this._drift = 0;
      this._isRunning = false;
      this._isPaused = false;
      this._eventEmitter = hasDOM() ? document.createElement('span') : hasEventEmitter() ? new events.EventEmitter() : undefined;
      this.on = this.addEventListener;
      this.off = this.removeEventListener; // Merge user options

      Object.assign(this, options);
    }
    /**
     * Timer instance
     * @private
     * @fires Timer#update    - Emitted when the Timer updates
     * @fires Timer#complete  - Emitted when the Timer completes
     */


    _createClass(Timer, [{
      key: "_instance",
      value: function _instance() {
        var _this = this;

        this._isRunning = true;
        this._currentTime = this.countdown ? this._timeAtStart - new Date() + this._startTime // countdown
        : new Date() - this._timeAtStart + this._startTime; // countup
        // Calc the updateFrequency offset (the drift - positive for overshooting)

        if (this.selfAdjust && !this.animationFrame) {
          this._drift = this.countdown ? this._expected - this._currentTime // countdown
          : this._currentTime - this._expected; // countdup
        } // If timer has completed, stop timer


        if (this.countdown ? this.endTime !== null && this._currentTime <= this.endTime || this._currentTime <= 0 // countdown
        : this.endTime !== null && this._currentTime >= this.endTime // countup
        ) {
            this._currentTime = this.endTime;
            this._isRunning = false;
            this.dispatchEvent('update', this);
            this.dispatchEvent('complete', this);
            return;
          } // Dispatch update event


        this.dispatchEvent('update', this); // Update the expected time for the next timer instance

        this.countdown ? this._expected -= this.updateFrequency : // countdown
        this._expected += this.updateFrequency; // countup
        // setTimout/reqAnimFrame for next timer instance

        this._timer = this.animationFrame ? requestAnimationFrame(function () {
          return _this._instance();
        }) : setTimeout(function () {
          return _this._instance();
        }, this.selfAdjust ? Math.max(0, this.updateFrequency - this._drift) : this.updateFrequency);
      }
      /**
       * Start the Timer
       * @method
       * @param {object}  [options]                       - User defined options to start the Timer with
       * @param {number}  [options.startTime=0]           - Start time in milliseconds
       * @param {number}  [options.endTime=null]          - End time in milliseconds || null for infinite
       * @param {number}  [options.updateFrequency=100]   - The frequency to update the timer
       * @param {boolean} [options.selfAdjust=true]       - Calculate the compensate for Timer drift by adjusting the updateFrequency
       * @param {boolean} [options.countdown=false]       - Countdown - Timer stops at 0 if endTime is not defined or negative
       * @param {boolean} [options.animationFrame=false]  - Use the browser window refresh rate as the Timer updateFrequncy - overwrites the updateFrequency setting
       *
       * @fires Timer#started                             - Emitted when the Timer is started
       */

    }, {
      key: "start",
      value: function start(options) {
        if (this._isRunning) return; // If paused, resume timer from current position
        // If not paused, start timer using the user options

        if (this._isPaused) {
          this._isPaused = false;
          this._timeAtStart = new Date().getTime();
          this._startTime = this._currentTime;
          this.dispatchEvent('started', this);

          this._instance();

          return;
        } // Merge user options into this


        Object.assign(this, options);
        this._timeAtStart = new Date().getTime();
        this._startTime = this.startTime;
        this._currentTime = this.startTime;
        this._expected = this.startTime;
        this.dispatchEvent('started', this); // Start the timer instance

        this._instance();
      }
      /**
       * Stop the Timer
       * @fires Timer#stopped  - Emitted when the Timer is stopped
       */

    }, {
      key: "stop",
      value: function stop() {
        if (!this._isRunning || this._isPaused) return;
        this._isRunning = false;
        this._isPaused = false;
        this.animationFrame ? cancelAnimationFrame(this._timer) : clearTimeout(this._timer);
        this.dispatchEvent('stopped', this);
      }
      /**
       * Pauses the Timer
       * @fires Timer#paused  - Emitted when the Timer is paused
       */

    }, {
      key: "pause",
      value: function pause() {
        if (!this._isRunning || this._isPaused) return;
        this._isRunning = false;
        this._isPaused = true;
        this.animationFrame ? cancelAnimationFrame(this._timer) : clearTimeout(this._timer);
        this.dispatchEvent('paused', this);
      }
      /**
       * Resets the timer
       * @fires Timer#update  - Emitted when the Timer is reset
       * @fires Timer#reset   - Emitted when the timer is reset
       */

    }, {
      key: "reset",
      value: function reset() {
        this.stop();
        this._isRunning = false;
        this._isPaused = false;
        this._currentTime = this.startTime;
        this._expected = this.startTime;
        this.dispatchEvent('update', this);
        this.dispatchEvent('reset', this);
      }
      /**
       * Add or minus time from the timer.
       * Timer must be running.
       * @param {number} val  - Amount of time to add in milliseconds (can be positive or negative)
       */

    }, {
      key: "adjustTime",
      value: function adjustTime(val) {
        if (!this._isRunning || this._isPaused) return;
        this._expected = this._expected + val;
        this._startTime = this._startTime + val;
      }
      /**
       * Returns the current time values of the timer
       * @returns {Object}  - Time values
       */

    }, {
      key: "addEventListener",

      /**
       * Adds event listener to the Timer
       * @param {string}    event      - Event to listen to
       * @param {function}  listener   - The event listener function
       */
      value: function addEventListener(event, listener) {
        if (hasDOM()) {
          this._eventEmitter.addEventListener(event, listener);
        } else if (hasEventEmitter()) {
          this._eventEmitter.on(event, listener);
        }
      }
      /**
       * Removes event listener from the Timer
       * @param  {string}   event     - Event to remove listener
       * @param  {function} listener  - Listener to remove
       */

    }, {
      key: "removeEventListener",
      value: function removeEventListener(event, listener) {
        if (hasDOM()) {
          this._eventEmitter.removeEventListener(event, listener);
        } else if (hasEventEmitter()) {
          this._eventEmitter.removeListener(event, listener);
        }
      }
      /**
       * Dispatches an event
       * @param  {string} event   - Event to dispatch
       */

    }, {
      key: "dispatchEvent",
      value: function dispatchEvent(event, data) {
        if (hasDOM()) {
          this._eventEmitter.dispatchEvent(new CustomEvent(event, {
            detail: data
          }));
        } else if (hasEventEmitter()) {
          this._eventEmitter.emit(event, data);
        }
      }
    }, {
      key: "getTime",
      get: function get() {
        return {
          milliseconds: Math.floor(this._currentTime % 1000),
          millisecondsTotal: Math.floor(this._currentTime),
          hundredths: Math.floor((this._currentTime % 1000 / 10).toFixed(0)),
          hundredthsTotal: Math.floor((this._currentTime / 10).toFixed(0)),
          tenths: Math.floor((this._currentTime % 1000 / 100).toFixed(0)),
          tenthsTotal: Math.floor((this._currentTime % 1000).toFixed(0)),
          seconds: Math.floor(this._currentTime / 1000 % 60),
          secondsTotal: Math.floor(this._currentTime / 1000),
          minutes: Math.floor(this._currentTime / 1000 / 60 % 60),
          minutesTotal: Math.floor(this._currentTime / 1000 / 60),
          hours: Math.floor(this._currentTime / 1000 / 60 / 60 % 24),
          hoursTotal: Math.floor(this._currentTime / 1000 / 60 / 60),
          days: Math.floor(this._currentTime / 1000 / 60 / 60 / 24),
          daysTotal: Math.floor(this._currentTime / 1000 / 60 / 60 / 24)
        };
      }
      /**
       * Returns if the Timer is running
       * @returns {boolean} Is the Timer running
       */

    }, {
      key: "isRunning",
      get: function get() {
        return this._isRunning;
      }
      /**
       * Returns if the Timer is paused
       * @returns {boolean} Is the Timer paused
       */

    }, {
      key: "isPaused",
      get: function get() {
        return this._isPaused;
      }
    }]);

    return Timer;
  }();

  exports.Timer = Timer;
  exports.pad = pad;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
