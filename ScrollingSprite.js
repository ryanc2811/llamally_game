export default class ScrollingSprite {
    constructor(image, x, y, width, height, speed) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    scroll() {
        this.x -= this.speed;
        if (this.x <= -this.width) {
            this.x = this.width - 1;
        }
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}