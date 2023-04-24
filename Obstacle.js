import GameObject from './GameObject.js';

export default class Obstacle extends GameObject {
  constructor(x, y, width, height, speed) {
    super(x, y, width, height);
    this.speed = speed;

    this.img = new Image();
    this.img.addEventListener('load', () => {
      this.frameWidth = this.img.width / this.numberOfFrames;
      this.frameHeight = this.img.height;
      this.width = this.height * (this.frameWidth / this.frameHeight);
    });
    this.img.src = './assets/birds.png';

    // Animation properties
    this.numberOfFrames = 8; // Set the total number of frames in the sprite sheet
    this.currentFrame = 0;
    this.frameCounter = 0;
    this.frameDuration = 100; // Duration in ms for each frame
  }

  update(deltaTime) {
    this.x -= this.speed;

    // Update the animation
    this.frameCounter += deltaTime;
    if (this.frameCounter > this.frameDuration) {
      this.currentFrame = (this.currentFrame + 1) % this.numberOfFrames;
      this.frameCounter = 0;
    }
  }

  draw(ctx) {
    ctx.drawImage(
      this.img,
      this.currentFrame * this.frameWidth,
      0,
      this.frameWidth,
      this.frameHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
