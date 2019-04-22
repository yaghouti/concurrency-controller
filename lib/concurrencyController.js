/**
 * Created by Majid Yaghouti on 4/4/2019.
 */
let Queue = require('./queue');

class ConcurrencyController {
  constructor(concurrencyLimit) {
    if (typeof concurrencyLimit !== 'number'
      || concurrencyLimit < 1
      || Math.floor(concurrencyLimit) !== concurrencyLimit) {

      throw new Error('Invalid concurrencyLimit! It must be integer and greater than zero.')
    }
    this.functionsList = new Queue();
    this.runIndex = 0;
    this.runningFunctionsNo = 0;
    this.allFunctionsResult = [];
    this.concurrencyLimit = concurrencyLimit;
  }

  finish(cb) {
    if (cb !== undefined) {
      if (typeof cb !== 'function') {
        throw new Error('Invalid callback! `cb` must be either `undefined` or a function.')
      }
      this.returnAllFunctionsResult = cb;
    }
    else {
      return new Promise((resolve, reject) => {
        this.resolveAllFunctionsResult = resolve;
      });
    }
  }

  setConcurrencyLimit(concurrencyLimit) {
    if (typeof concurrencyLimit !== 'number'
      || concurrencyLimit < 1
      || Math.floor(concurrencyLimit) !== concurrencyLimit) {

      throw new Error('Invalid concurrencyLimit! It must be integer and greater than zero.')
    }

    setImmediate(() => {
      if (this.concurrencyLimit < concurrencyLimit) {
        for (let i = this.concurrencyLimit; i < concurrencyLimit; i++) {
          runNextFunctionIfConcurrencyLimitNotExceeded.bind(this)();
        }
      }
      this.concurrencyLimit = concurrencyLimit;
    });
  }

  add(func, ...args) {
    if (typeof func !== 'function') {
      throw new Error('Invalid function! `func` must be a function.')
    }

    let cb;
    if (args.length && typeof args[args.length - 1] === 'function') {
      cb = args.splice(args.length - 1, 1)[0];
      this.functionsList.push({func: func, args: args, cb: cb});
      runNextFunctionIfConcurrencyLimitNotExceeded.bind(this)();
    }
    else {
      return new Promise((resolve, reject) => {
        this.functionsList.push({func: func, args: args, resolve: resolve, reject: reject});
        runNextFunctionIfConcurrencyLimitNotExceeded.bind(this)();
      });
    }
  }
}

function runNextFunctionIfConcurrencyLimitNotExceeded() {
  setImmediate(() => {
    if (this.runningFunctionsNo < this.concurrencyLimit) {
      runNextFunction.bind(this)();
    }
  });
}

function runNextFunction() {
  let funcObj = this.functionsList.pop();
  if (!funcObj) {
    if (this.runningFunctionsNo === 0) {
      if (this.returnAllFunctionsResult) {
        return this.returnAllFunctionsResult(this.allFunctionsResult);
      }
      else if (this.resolveAllFunctionsResult) {
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
    .catch((error) => {
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
  return new Promise(function (resolve, reject) {
    Promise.all([func(...args)])
      .then(function (result) {
        resolve(result[0]);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

module.exports = ConcurrencyController;