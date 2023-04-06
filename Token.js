import GameObject from './GameObject.js';

export default class Token extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.speed = 2;
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, 2 * Math.PI);
    ctx.fill();
  }
}
