import GameObject from './GameObject.js';

export default class Obstacle extends GameObject {
    constructor(x, y, width, height, speed) {
      super(x, y, width, height);
      this.speed = speed;
    }

  update() {
    this.x -= this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

}
