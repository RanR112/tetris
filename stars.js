const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const starArray = [];
const numberOfStars = 200;

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.brightness = Math.random();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        this.brightness = Math.sin(Date.now() * 0.001 * this.size) * 0.5 + 0.5;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createStars() {
    for (let i = 0; i < numberOfStars; i++) {
        starArray.push(new Star());
    }
}

function handleStars() {
    for (let i = 0; i < starArray.length; i++) {
        starArray[i].update();
        starArray[i].draw();

        const dx = mouse.x - starArray[i].x;
        const dy = mouse.y - starArray[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
    }
}

const particleArray = [];
const mouse = {
    x: undefined,
    y: undefined,
};

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleStars();
    requestAnimationFrame(animate);
}

createStars();
animate();

canvas.addEventListener("mousemove", (event) => {
    const mouseX = event.x;
    const mouseY = event.y;

    starArray.forEach(star => {
        const dx = mouseX - star.x;
        const dy = mouseY - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
            star.x += dx * 0.01;
            star.y += dy * 0.01;
        }
    });
});
