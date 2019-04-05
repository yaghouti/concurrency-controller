/**
 * Created by Majid Yaghouti on 4/4/2019.
 */
let ConcurrencyController = require('../lib/concurrencyController');
let concurrencyLimit = 2;
let myConcurrentList = new ConcurrencyController(concurrencyLimit);

for (let i = 0; i < 3; i++) {
  myConcurrentList.add(sampleFunc, 1000 * (i + 1))
    .then(function (result) {
      console.log('Success > delay:', result);
    })
    .catch(function (error) {
      console.log('Error > delay:', error);
    });
}
myConcurrentList.setConcurrencyLimit(3);
for (let i = 0; i < 3; i++) {
  myConcurrentList.add(sampleFunc, 1000 * (i + 1), function (error, result) {
    if (error) {
      console.log('Error > delay:', error);
    }
    else {
      console.log('Success > delay:', result);
    }
  });
}
myConcurrentList.add(sampleFunc, 1000 * (0.5 + 1))
  .then(function (result) {
    console.log('Success > delay:', result);
  })
  .catch(function (error) {
    console.log('Error > delay:', error);
  })
  .finally(function () {
    myConcurrentList.add(sampleFunc, 600)
      .then(function (result) {
        console.log('Success > delay:', result);
      })
      .catch(function (error) {
        console.log('Error > delay:', error);
      });
  });

myConcurrentList.finish(function (functionsResult) {
  functionsResult.forEach(function (functionResult) {
    console.log('Error:', functionResult.error, 'Result:', functionResult.result);
  });
});


function sampleFunc(delay) {
  if (Math.random() < 0.5) {
    return (delay);
  }
  else {
    throw delay;
  }
  /*return new Promise((resolve, reject)=> {
    setTimeout(function () {
      if (Math.random() < 0.5) {
        resolve(delay);
      }
      else {
        reject(delay);
      }
    }, delay);
  })*/
}