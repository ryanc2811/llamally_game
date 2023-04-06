import GameObject from './GameObject.js';

export default class Llama extends GameObject {
  constructor(x, y, width, height, canvas) {
    super(x, y, width, height);
    this.canvas = canvas;
    this.jumpForce = -6;
    this.gravity = 0.2;
    this.velocityY = 0;
    this.update(); // Call update() in the constructor
  }

  update() {
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    // Keep the llama within the canvas
    if (this.y < 0) {
      this.y = 0;
      this.velocityY = 0;
    }
    if (this.y + this.height > this.canvas.height) {
      this.y = this.canvas.height - this.height;
      this.velocityY = 0;
    }
  }

  jump() {
    this.velocityY = this.jumpForce;
  }

  draw(ctx, color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}