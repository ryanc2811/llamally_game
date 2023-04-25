import GameObject from './GameObject.js';

export default class PowerUp extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.speed = 100;
    this.type = '';
    this.SLOW_TIME_FACTOR = 0.5;
    this.images = {
      slow_time: new Image(),
      double_points: new Image(),
      shield: new Image(),
      magnet: new Image(),
      default: new Image(),
    };

    this.images.slow_time.src = './assets/slow_time.png';
    this.images.double_points.src = './assets/double_points.png';
    this.images.shield.src = './assets/shield.png';
    this.images.default.src = './assets/magnet.png';
    this.images.magnet.src = './assets/magnet.png';

  }

  setType(type) {
    this.type = type;
    this.images[this.type].addEventListener('load', () => {
      // Preserve the aspect ratio of the image
      this.width = this.height * (this.images[this.type].width / this.images[this.type].height);
    });
  }

  update(slowTimeActive, deltaTime) {
    const speedFactor = slowTimeActive ? this.SLOW_TIME_FACTOR : 1;
    this.x -= (this.speed * deltaTime) * speedFactor;
  }

  draw(ctx) {
    ctx.drawImage(this.images[this.type], this.x, this.y, this.width, this.height);
  }
}
