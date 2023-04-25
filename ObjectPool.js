import Obstacle from './Obstacle.js';
import Token from './Token.js';
import PowerUp from './PowerUp.js';

export default class ObjectPool {
  constructor() {
    this.pool = new Map();
    this.pool.set(Obstacle, []);
    this.pool.set(Token, []);
    this.pool.set(PowerUp, []);
    this.maxSize = 50; // Set the maximum size for each pool
  }

  get(cls, ...args) {
    let obj;
    if (this.pool.has(cls) && this.pool.get(cls).length > 0) {
      obj = this.pool.get(cls).pop();
    } else {
      obj = new cls(...args);
    }
    return obj;
  }


  release(obj, ...params) {
    if (this.pool.has(obj.constructor)) {
      if (this.pool.get(obj.constructor).length < this.maxSize) {
        if (typeof obj.reset === 'function') {
          obj.reset(...params);
        }
        this.pool.get(obj.constructor).push(obj);
      }
    } else {
      throw new Error('Invalid object provided');
    }
  }


  reset() {
    for (const [Class, instances] of this.pool.entries()) {
      instances.length = 0;
    }
  }

  getPool(Class) {
    if (this.pool.has(Class)) {
      return this.pool.get(Class);
    } else {
      throw new Error('Invalid class provided');
    }
  }
}
