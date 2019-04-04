# Concurrentize
Runs functions concurrently with a degree of concurrency.

It puts your functions in a queue and keeps a specific number of them (concurrencyLimit) running at any period of time


# How to install
```
npm install concurrentize
```

# Usage
```javascript
let Concurrentize = require('concurrentize');
let concurrencyLimit = 2;
let myConcurrentList = new Concurrentize(concurrencyLimit);

// Put several functions and corresponding arguments into myConcurrentList
for (let i = 0; i < 1000; i++) {
  myConcurrentList.add(sampleAsyncFunc, i)
    .then(function (result) {
      console.log('Success > ', result);
    })
    .catch(function (error) {
      console.log('Error > ', error);
    });
}

// You can change concurrency limit during execution
myConcurrentList.setConcurrencyLimit(3);

// You can get result of all function calls when all of them executed
// By callback
myConcurrentList.finish(function (functionsResult) {
  functionsResult.forEach(function (functionResult) {
    console.log('Error:', functionResult.error, '- Result:', functionResult.result); // Error: false - Result: 'some result'
  });
});

// Or by promise
myConcurrentList.finish()
.then(function (functionsResult) {
  functionsResult.forEach(function (functionResult) {
      console.log('Error:', functionResult.error, '- Result:', functionResult.result); // Error: false - Result: 'some result'
    });
});

function sampleAsyncFunc(i) {
  return new Promise((resolve, reject)=> {
    // your code
  });
}
```