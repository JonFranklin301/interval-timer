let events =
  typeof module !== 'undefined' &&
  module.exports &&
  typeof require === 'function'
    ? require('events')
    : undefined;

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
export function pad(pad, string, padLeft) {
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
export class Timer {
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
  constructor(options) {
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
    this._eventEmitter = hasDOM()
      ? document.createElement('span')
      : hasEventEmitter()
      ? new events.EventEmitter()
      : undefined;
    this.on = this.addEventListener;
    this.off = this.removeEventListener;

    // Merge user options
    Object.assign(this, options);
  }

  /**
   * Timer instance
   * @private
   * @fires Timer#update    - Emitted when the Timer updates
   * @fires Timer#end       - Emitted when the Timer ends
   */
  _instance() {
    this._isRunning = true;
    this._currentTime = this.countdown
      ? this._timeAtStart - new Date() + this._startTime // countdown
      : new Date() - this._timeAtStart + this._startTime; // countup

    // Calc the updateFrequency offset (the drift - positive for overshooting)
    if (this.selfAdjust && !this.animationFrame) {
      this._drift = this.countdown
        ? this._expected - this._currentTime // countdown
        : this._currentTime - this._expected; // countdup
    }

    // If timer has completed, stop timer
    if (
      this.countdown
        ? (this.endTime !== null && this._currentTime <= this.endTime) ||
          this._currentTime <= 0 // countdown
        : this.endTime !== null && this._currentTime >= this.endTime // countup
    ) {
      this._currentTime = this.endTime;
      this._isRunning = false;
      this.dispatchEvent('update', this);
      this.dispatchEvent('end', this);
      return;
    }

    // Dispatch update event
    this.dispatchEvent('update', this);

    // Update the expected time for the next timer instance
    this.countdown
      ? (this._expected -= this.updateFrequency) // countdown
      : (this._expected += this.updateFrequency); // countup

    // setTimout/reqAnimFrame for next timer instance
    this._timer = this.animationFrame
      ? requestAnimationFrame(() => this._instance())
      : setTimeout(
          () => this._instance(),
          this.selfAdjust
            ? Math.max(0, this.updateFrequency - this._drift)
            : this.updateFrequency
        );
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
   * @fires Timer#start                               - Emitted when the Timer is started
   */
  start(options) {
    if (this._isRunning) return;

    // If paused, resume timer from current position
    // If not paused, start timer using the user options
    if (this._isPaused) {
      this._isPaused = false;
      this._timeAtStart = new Date().getTime();
      this._startTime = this._currentTime;

      this.dispatchEvent('start', this);

      this._instance();
      return;
    }

    // Merge user options into this
    Object.assign(this, options);

    this._timeAtStart = new Date().getTime();
    this._startTime = this.startTime;
    this._currentTime = this.startTime;
    this._expected = this.startTime;

    this.dispatchEvent('start', this);

    // Start the timer instance
    this._instance();
  }

  /**
   * Stop the Timer
   * @fires Timer#stop    - Emitted when the Timer is stopped
   */
  stop() {
    if (!this._isRunning || this._isPaused) return;
    this._isRunning = false;
    this._isPaused = false;
    this.animationFrame
      ? cancelAnimationFrame(this._timer)
      : clearTimeout(this._timer);
    this.dispatchEvent('stop', this);
  }

  /**
   * Pauses the Timer
   * @fires Timer#pause   - Emitted when the Timer is paused
   */
  pause() {
    if (!this._isRunning || this._isPaused) return;
    this._isRunning = false;
    this._isPaused = true;
    this.animationFrame
      ? cancelAnimationFrame(this._timer)
      : clearTimeout(this._timer);
    this.dispatchEvent('pause', this);
  }
  /**
   * Resets the timer
   * @fires Timer#update  - Emitted when the Timer is reset
   * @fires Timer#reset   - Emitted when the timer is reset
   */
  reset() {
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
  adjustTime(val) {
    if (!this._isRunning || this._isPaused) return;
    this._expected = this._expected + val;
    this._startTime = this._startTime + val;
  }

  /**
   * Returns the current time values of the timer
   * @returns {Object}  - Time values
   */
  get getTime() {
    return {
      milliseconds: Math.floor(this._currentTime % 1000),
      millisecondsTotal: Math.floor(this._currentTime),
      hundredths: Math.floor(((this._currentTime % 1000) / 10).toFixed(0)),
      hundredthsTotal: Math.floor((this._currentTime / 10).toFixed(0)),
      tenths: Math.floor(((this._currentTime % 1000) / 100).toFixed(0)),
      tenthsTotal: Math.floor((this._currentTime % 1000).toFixed(0)),
      seconds: Math.floor((this._currentTime / 1000) % 60),
      secondsTotal: Math.floor(this._currentTime / 1000),
      minutes: Math.floor((this._currentTime / 1000 / 60) % 60),
      minutesTotal: Math.floor(this._currentTime / 1000 / 60),
      hours: Math.floor((this._currentTime / 1000 / 60 / 60) % 24),
      hoursTotal: Math.floor(this._currentTime / 1000 / 60 / 60),
      days: Math.floor(this._currentTime / 1000 / 60 / 60 / 24),
      daysTotal: Math.floor(this._currentTime / 1000 / 60 / 60 / 24)
    };
  }

  /**
   * Returns if the Timer is running
   * @returns {boolean} Is the Timer running
   */
  get isRunning() {
    return this._isRunning;
  }

  /**
   * Returns if the Timer is paused
   * @returns {boolean} Is the Timer paused
   */
  get isPaused() {
    return this._isPaused;
  }

  /**
   * Adds event listener to the Timer
   * @param {string}    event      - Event to listen to
   * @param {function}  listener   - The event listener function
   */
  addEventListener(event, listener) {
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
  removeEventListener(event, listener) {
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
  dispatchEvent(event, data) {
    if (hasDOM()) {
      this._eventEmitter.dispatchEvent(
        new CustomEvent(event, { detail: data })
      );
    } else if (hasEventEmitter()) {
      this._eventEmitter.emit(event, data);
    }
  }
}
