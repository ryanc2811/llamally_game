import GameObject from './GameObject.js';

export default class Token extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.speed = 100;
    this.img = new Image(); // Add an img property
    this.img.addEventListener('load', () => {
      // Preserve the aspect ratio of the image
      this.width = this.height * (this.img.width / this.img.height);
    });

    this.img.src = './assets/token.png'; // Set the src property to the path of the llama PNG file
  }

  update(deltaTime) {
    this.x -= this.speed * deltaTime;
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}
