const Timer = require('../dist/interval-timer.umd').Timer;
// Or
// import { Timer } from '../dist/interval-timer.umd';

const timer = new Timer();

timer.on('update', () => {
  console.log(`The Timer started ${timer.getTime.secondsTotal} seconds ago.`);
});

timer.on('end', () => {
  console.log(
    `The Timer has finished after ${timer.getTime.secondsTotal} seconds!`
  );
});

timer.start({
  endTime: 10000,
  updateFrequency: 1000
});
