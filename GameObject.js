export default class GameObject {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
  
    update() {
      // Implement this method in child classes to define the update logic
    }
  
    draw(ctx) {
      // Implement this method in child classes to define the draw logic
    }
  
    collidesWith(other) {
        const leniency = 4; // You can adjust this value to increase or decrease the leniency

        // Reduce the width and height of both objects for collision checks
        const thisWidth = this.width - leniency;
        const thisHeight = this.height - leniency;
        const otherWidth = other.width - leniency;
        const otherHeight = other.height - leniency;
      
        return (
          this.x < other.x + otherWidth &&
          this.x + thisWidth > other.x &&
          this.y < other.y + otherHeight &&
          this.y + thisHeight > other.y
        );
    }
  
    reset() {
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
    }
  }
  