import GameObject from './GameObject.js';

export default class Llama extends GameObject {
  constructor(x, y, width, height, canvas) {
    super(x, y, width, height);
    this.canvas = canvas;
    this.jumpForce = -5.5;
    this.gravity = 0.2;
    this.velocityY = 0;

    this.img = new Image(); // Add an img property
    this.img.addEventListener('load', () => {
      // Preserve the aspect ratio of the image
      this.width = this.height * (this.img.width / this.img.height);
    });

    this.img.src = './assets/llama.png'; // Set the src property to the path of the llama PNG file
    this.update(); // Call update() in the constructor
  }

  update(deltaTime) {
    // Slow the fall if the input is held and there's remaining slow fall time
    if (this.inputHeld && this.velocityY > 0) {
      this.velocityY += this.gravity * 0.1; // Apply reduced gravity
    } else {
      this.velocityY += this.gravity; // Apply full gravity
    }
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


  setInputHeld(value) {
    this.inputHeld = value;
  }

  jump() {
    this.velocityY = this.jumpForce;
  }

  draw(ctx) {
    //ctx.fillStyle = color;
    // Draw the llama image instead of a rectangle
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}
