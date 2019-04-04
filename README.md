# Concurrentize
Invokes functions concurrently with a given degree of concurrency.

It puts given functions in a queue and keeps a specific number of them (concurrencyLimit) running simultaneously. By the time a function's execution gets done (resolves or rejects), another function from the queue is invoked.


**To install:**
> npm install concurrentize

**Usage:**
```javascript
let Concurrentize = require('concurrentize');
let concurrencyLimit = 2;
let myConcurrentList = new Concurrentize(concurrencyLimit);

// Put several functions and corresponding arguments into myConcurrentList
for (let i = 0; i < 1000; i++) {
  myConcurrentList.add(sampleAsyncFunc, i, 'arg2')
    .then(function (result) {
      console.log('Success > ', result);
    })
    .catch(function (error) {
      console.log('Error > ', error);
    });
}

// You can change concurrency limit during execution
myConcurrentList.setConcurrencyLimit(3);

// You can get result via callback
myConcurrentList.add(sampleAsyncFunc, 'arg1', 'arg2', function (error, result) {
  if (error) {
    console.log('Error > ', error);
  }
  else {
    console.log('Success > ', result);
  }
});

// You can get result of all function calls when all of them executed
// By callback:
myConcurrentList.finish(function (functionsResult) {
  functionsResult.forEach(function (functionResult) {
    console.log('Error:', functionResult.error, '- Result:', functionResult.result);
    // Error: false - Result: 'some result'
  });
});
// Or by promise:
myConcurrentList.finish()
.then(function (functionsResult) {
  functionsResult.forEach(function (functionResult) {
      console.log('Error:', functionResult.error, '- Result:', functionResult.result);
      // Error: false - Result: 'some result'
    });
});

function sampleAsyncFunc(arg1, arg2) {
  return new Promise((resolve, reject)=> {
    // your code
  });
}
```
# License
MIT License

Copyright (c) 2019 Majid Yaghouti

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.