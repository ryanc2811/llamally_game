export default class CircleCollider {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    setPosition(x, y) {
        console.log('Setting position before:', this.x, this.y, 'with values:', x, y);
        this.x = x;
        this.y = y;
        console.log('Setting position after:', this.x, this.y);
    }



    collidesWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.radius + other.radius;
    }

    draw(ctx) {
        console.log(this.radius);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'red';
        ctx.stroke();
        ctx.closePath();
    }
}
