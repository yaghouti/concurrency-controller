/**
 * Created by Majid Yaghouti on 4/4/2019.
 */
class Queue {
  constructor(items) {
    this.list = items || [];
  }

  push(item) {
    this.list.splice(this.list.length, 0, item);
  }

  pop() {
    return this.list.shift();
  }

}

module.exports = Queue;