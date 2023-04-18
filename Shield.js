import GameObject from './GameObject.js';

export default class Shield extends GameObject {

    constructor(x, y, radius, canvas) {
        super(x, y, radius * 2, radius * 2); // Set width and height to be twice the radius
        this.canvas = canvas;
        this.radius = radius;
        this.active = false;

        this.shieldTimer = 0;
        this.SHIELD_DURATION = 5; // 5 seconds

        this.img = new Image(); // Add an img property
        this.img.addEventListener('load', () => {
            // Preserve the aspect ratio of the image
            this.width = this.height * (this.img.width / this.img.height);
        });

        this.img.src = './bubble.png'; // Set the src property to the path of the llama PNG file
    }

    activate() {
        this.shieldTimer = 0;
        this.active = true;
    }

    deactivate() {
        this.active = false;
    }

    update(deltaTime, llama) {
        // Update shield position to follow the llama
        this.x = llama.x + llama.width / 2 - this.radius;
        this.y = llama.y + llama.height / 2 - this.radius;

        // Update shield power-up timer
        if (this.active) {
            this.shieldTimer += deltaTime;
            if (this.shieldTimer >= this.SHIELD_DURATION) {
                this.active = false;
                this.shieldTimer = 0;
            }
        }
    }

    draw(ctx) {
        if (this.active) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }
}
