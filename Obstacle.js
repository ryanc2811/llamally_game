import GameObject from './GameObject.js';
import CircleCollider from './CircleCollider.js';

export default class Obstacle extends GameObject {
  constructor(x, y, width, height, speed) {
    super(x, y, width, height);
    this.speed = speed;

    this.img = new Image();

    // Animation properties
    this.numberOfFrames = 8;
    this.currentFrame = 0;
    this.frameCounter = 0;
    this.frameDuration = 0.1;
    this.SLOW_TIME_FACTOR = 0.5;

    this.loadImage('./assets/birds.png');
  }

  setCollider(colliderRadius) {
    // Collider properties
    this.collider = new CircleCollider(
      this.x + this.width / 2,
      this.y + this.height / 2,
      colliderRadius
    );
  }

  async loadImage(src) {
    return new Promise((resolve) => {
      this.img.src = src;
      this.img.onload = () => {
        this.frameWidth = Math.floor(this.img.width / this.numberOfFrames);
        this.frameHeight = this.img.height;
        this.width = this.height * (this.frameWidth / this.frameHeight);
        if (this.collider) {
          this.collider.setPosition(this.x + this.width / 2, this.y + this.height / 2);
        }
        resolve(true);
      };
    });
  }



  reset(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.width = width;
    this.height = height;
    console.log("RESET " + width + " : " + height)
    if (this.collider) {
      this.collider.setPosition(this.x + this.width / 2, this.y + this.height / 2);
    }
  }


  updateCollider() {
    if (this.collider) {
      this.collider.setPosition(this.x + this.width / 2, this.y + this.height / 2);
    }
  }

  update(slowTimeActive, deltaTime) {
    const speedFactor = slowTimeActive ? this.SLOW_TIME_FACTOR : 1;
    this.x -= this.speed * deltaTime * speedFactor;

    // Update the animation
    this.frameCounter += deltaTime;
    if (this.frameCounter > this.frameDuration) {
      this.frameCounter -= this.frameDuration;
      this.currentFrame = (this.currentFrame + 1) % this.numberOfFrames;
    }

    // Update collider position
    this.updateCollider();
  }

  draw(ctx, debug) {

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

    console.log("Width: " + this.width, "Height: " + this.height, "Frame Width: " + this.frameWidth + "Frame Height: " + this.frameHeight);
    // Draw collider circle for debugging
    if (debug) {
      this.collider.draw(ctx);
      // Draw a square for debugging
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.stroke();
    }
  }
}
