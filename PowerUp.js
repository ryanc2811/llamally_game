import GameObject from './GameObject.js';

export default class PowerUp extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.speed = 1;
    this.type = '';
  }

  setType(type) {
    this.type = type;
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx) {
    if (this.type === 'slow_time') {
      ctx.fillStyle = 'yellow';
    } else if (this.type === 'double_points') {
      ctx.fillStyle = 'green';
    } else if (this.type === 'shield') {
      ctx.fillStyle = 'blue';
    } else {
      ctx.fillStyle = 'purple';
    }
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
