import Obstacle from './Obstacle.js';
import Token from './Token.js';
import PowerUp from './PowerUp.js';

export default class ObjectPool {
    constructor() {
      this.pool = new Map(); // Initialize the pool property
      this.pool.set(Obstacle, []);
      this.pool.set(Token, []);
      this.pool.set(PowerUp, []);
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
  
    release(obj) {
        console.log('object released:', obj);
        if (obj instanceof Obstacle) {
          obj.reset();
        } else if (obj instanceof Token) {
          obj.reset();
        } else if (obj instanceof PowerUp) {
          obj.reset();
        }
        this.pool.get(obj.constructor).push(obj);
        console.log('object pool:', this.pool);
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
