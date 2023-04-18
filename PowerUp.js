import GameObject from './GameObject.js';

export default class PowerUp extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.speed = 1;
    this.type = '';

    this.images = {
      slow_time: new Image(),
      double_points: new Image(),
      shield: new Image(),
      magnet: new Image(),
      default: new Image(),
    };

    this.images.slow_time.src = './slow-time.png';
    this.images.double_points.src = './double-points.png';
    this.images.shield.src = './shield.png';
    this.images.default.src = './double-points.png';
    this.images.magnet.src = './magnet.png';

  }

  setType(type) {
    this.type = type;
    this.images[this.type].addEventListener('load', () => {
      // Preserve the aspect ratio of the image
      this.width = this.height * (this.images[this.type].width / this.images[this.type].height);
    });
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx) {
    ctx.drawImage(this.images[this.type], this.x, this.y, this.width, this.height);
  }
}
