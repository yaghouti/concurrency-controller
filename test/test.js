/**
 * Created by Majid Yaghouti on 4/4/2019.
 */
let Concurrentize = require('../lib/concurrentize');
let concurrencyLimit = 2;
let concurrentList1 = new Concurrentize(concurrencyLimit);

for (let i = 0; i < 3; i++) {
  concurrentList1.add(sampleFunc, 1000 * (i + 1))
    .then(function (result) {
      console.log('Success > delay:', result);
    })
    .catch(function (error) {
      console.log('Error > delay:', error);
    });
}
concurrentList1.setConcurrencyLimit(3);
for (let i = 0; i < 3; i++) {
  concurrentList1.add(sampleFunc, 1000 * (i + 1), function (error, result) {
    if (error) {
      console.log('Error > delay:', error);
    }
    else {
      console.log('Success > delay:', result);
    }
  });
}
concurrentList1.add(sampleFunc, 1000 * (0.5 + 1))
  .then(function (result) {
    console.log('Success > delay:', result);
  })
  .catch(function (error) {
    console.log('Error > delay:', error);
  })
  .finally(function () {
    concurrentList1.add(sampleFunc, 600)
      .then(function (result) {
        console.log('Success > delay:', result);
      })
      .catch(function (error) {
        console.log('Error > delay:', error);
      });
  });

concurrentList1.finish(function (functionsResult) {
  functionsResult.forEach(function (functionResult) {
    console.log('Error:', functionResult.error, 'Result:', functionResult.result);
  });
});


function sampleFunc(delay) {
  return new Promise((resolve, reject)=> {
    setTimeout(function () {
      if (Math.random() < 0.5) {
        resolve(delay);
      }
      else {
        reject(delay);
      }
    }, delay);
  })
}