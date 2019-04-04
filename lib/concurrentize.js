/**
 * Created by Majid Yaghouti on 4/4/2019.
 */
let Queue = require('./queue');

class Concurrentize {
  constructor(concurrencyLimit) {
    this.list = new Queue();
    this.runIndex = 0;
    this.runningFunctionsNo = 0;
    this.allFunctionsResult = [];
    this.concurrencyLimit = concurrencyLimit;
  }

  finish(cb) {
    if (cb) {
      this.returnAllFunctionsResult = cb;
    }
    else {
      return new Promise((resolve, reject) => {
        this.resolveAllFunctionsResult = resolve;
      });
    }
  }

  setConcurrencyLimit(concurrencyLimit) {
    setImmediate(()=> {
      if (this.concurrencyLimit < concurrencyLimit) {
        for (let i = this.concurrencyLimit; i < concurrencyLimit; i++) {
          runNextFunctionIfConcurrencyLimitNotExceeded.bind(this)();
        }
      }
      this.concurrencyLimit = concurrencyLimit;
    });
  }

  add(func, ...args) {
    let cb;
    if (typeof args[args.length - 1] === 'function') {
      cb = args.splice(args.length - 1, 1)[0];
      this.list.push({func: func, args: args, cb: cb});
      runNextFunctionIfConcurrencyLimitNotExceeded.bind(this)();
    }
    else {
      return new Promise((resolve, reject)=> {
        this.list.push({func: func, args: args, resolve: resolve, reject: reject});
        runNextFunctionIfConcurrencyLimitNotExceeded.bind(this)();
      });
    }
  }
}

function runNextFunctionIfConcurrencyLimitNotExceeded() {
  setImmediate(()=> {
    if (this.runningFunctionsNo < this.concurrencyLimit) {
      runNextFunction.bind(this)();
    }
  });
}

function runNextFunction() {
  let funcObj = this.list.pop();
  if (!funcObj) {
    if (this.runningFunctionsNo === 0) {
      if (this.returnAllFunctionsResult) {
        return this.returnAllFunctionsResult(this.allFunctionsResult);
      }
      else {
        this.resolveAllFunctionsResult(this.allFunctionsResult);
      }
    }

    return;
  }

  this.runningFunctionsNo++;

  let promise = promisify(funcObj.func, ...funcObj.args);
  funcObj.index = this.runIndex++;

  promise
    .then((result) => {
      this.runningFunctionsNo--;
      this.allFunctionsResult[funcObj.index] = {error: false, result: result};
      runNextFunctionIfConcurrencyLimitNotExceeded.bind(this)();
      if (funcObj.cb) {
        funcObj.cb(null, result);
      }
      else {
        funcObj.resolve(result);
      }
    })
    .catch((error)=> {
      this.runningFunctionsNo--;
      this.allFunctionsResult[funcObj.index] = {error: true, result: error};
      runNextFunctionIfConcurrencyLimitNotExceeded.bind(this)();
      if (funcObj.cb) {
        funcObj.cb(error);
      }
      else {
        funcObj.reject(error);
      }
    });
}

function promisify(func, ...args) {
  return Promise.all([func(...args)])
    .then(function (result) {
      return result[0];
    });
}

module.exports = Concurrentize;