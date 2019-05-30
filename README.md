# Interval-Timer

Interval-Timer is a time-accurate count up/down timer.

```javascript
import { Timer } from 'interval-timer';

const timer = new Timer();

timer.start();
```

#### Methods

- `start(options)` Start the Timer.
- `stop()` Stop the Timer. When restarted, the timer will reset from the initial startTime value.
- `pause()` Pause the Timer. When restarted, the Timer will continue from where it was stopped.
- `adjustTime(value)` Adjust the Timer - positive or negative int (in milliseconds). Timer must be running.
- `addEventListener(event, function)` Add an event listener to the Timer.
- `removeEventListener(event, function)` Remove an event listener from the Timer.
- `on()` Alias for addEventListener.
- `off()` Alias for removeEventListener.

#### Properties

The following properties are available to access:

- `getTime` Get the current time values. Returns an object containing the following:
  - `milliseconds`
  - `millisecondsTotal`
  - `hundredths`
  - `hundredthsTotal`
  - `tenths`
  - `tenthsTotal`
  - `seconds`
  - `secondsTotal`
  - `minutes`
  - `minutesTotal`
  - `hours`
  - `hoursTotal`
  - `days`
  - `daysTotal`
- `isRunning`
- `isPaused`

#### Events

The timer will emit the following events:

- `start` Emitted when the Timer starts
- `stop` Emitted when the Timer is stopped
- `pause` Emitted when the Timer is paused
- `reset` Emitted when the Timer is reset
- `update` Emitted when the Timer updates (based on the updateFrequency)
- `end` Emitted when the Timer ends (reaches the `options.endTime` time)

#### Timer Options

An object containing user defined options can be passed into either the Timer instance `new Timer(options)` or into the Start method `Timer.start(options)` .

- `startTime` Start time in milliseconds
- `endTime` End time in milliseconds or `null` for infinite
- `updateFrequency` The frequency to update the timer
- `selfAdjust` Calculate the compensate for Timer drift by adjusting the updateFrequency
- `countdown` If true, the Timer will stop at 0 if endTime is not defined or negative
- `animationFrame` Use the browser window refresh rate as the Timer updateFrequncy - this will overwrite the updateFrequency setting

```javascript
import { Timer } from 'interval-timer'

// Default options
const options = {
	startTime: 0
	endTime: null
	updateFrequency: 100
	selfAdjust: true
	countdown: false
	animationFrame: false
}

const timer1 = new Timer(options)
timer1.start()

// or
const timer2 = new Timer()
timer2.start(options)
```

### Pad Function

The Timer will return the exact time value, so with milliseconds it could return 1, 32 or 405 for example.
To help keep values uniform, the Pad function can be used to pad these numbers, so instead of 1, 32 and 405, it would return 001, 032 and 405.

```javascript
pad(pad, string, padLeft);
```

- pad - String - String to us as a padding
- string - String - String to be padded
- padLeft - Boolean - Pad from left to right or right to left

Example:

```javascript
import { Timer, pad } from 'interval-timer';
// or
const Timer = require('interval-timer').Timer;
const pad = require('interval-timer').pad;

const timer = new Timer();

timer.on('update', () => {
  console.log(pad('000', timer.getTime.milliseconds, true));
});

timer.start();
```

## Examples

### Node.js

```javascript
import { Timer } from 'interval-timer'
// or
const Timer = require('interval-timer').Timer

const options = {
	startTime: 0
	endTime: 60000
	updateFrequency: 1000
}

const timer = new Timer(options)

timer.on('update', () => {
	console.log(timer.getTime.seconds)
});
timer.on('end', () => {
	console.log('Timer has completed!')
});

// Start the timer
timer.start()

// Adjust the timer (- 5 seconds after 10 seconds)
setTimeout(() => {
	timer.adjustTime(-5000)
}, 10000)
```

### In Browser

interval-timer can be used in the browser. Include the `interval-timer.umd.js` script and you will have access to `window.intervalTimer`

```html
<script src="dist/interval-timer.umd.js"></script>
<script>
  var timer = new intervalTimer.Timer();

  timer.on('update', function() {
    console.log(timer.getTime.millisecondsTotal);
  });

  timer.on('start', function() {
    console.log('The timer has started!');
  });

  timer.start();
</script>
```

Using the browser window refresh rate to update the Timer - this uses requestAnimationFrame() as the updateFrequency

```html
<div id="time"></div>

<script src="dist/interval-timer.umd.js"></script>
<script>
  var timer = new intervalTimer.Timer({ animationFrame: true });

  timer.on('update', function() {
    var time = timer.getTime;
    document.getElementById('time').innerHTML =
      intervalTimer.pad('00', time.hours, true) +
      ':' +
      intervalTimer.pad('00', time.minutes, true) +
      ':' +
      intervalTimer.pad('00', time.seconds, true) +
      '.' +
      intervalTimer.pad('00', time.milliseconds);
  });

  timer.start();
</script>
```

## Development

- `npm run build` builds the library to dist.
- `npm run dev` builds the library, then keeps rebuilding it whenever the source files are changed.

## License

See [LICENSE](./LICENSE) file for details.
