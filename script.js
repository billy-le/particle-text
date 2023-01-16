window.addEventListener("DOMContentLoaded", () => {
  class Particle {
    constructor(effect, x, y, color) {
      this.effect = effect;
      this.x = Math.random() * effect.canvasWidth;
      this.y = effect.canvasHeight;
      this.color = color;
      this.originX = x;
      this.originY = y;
      this.size = effect.gap;
      this.dx = 0;
      this.dy = 0;
      this.vx = 0;
      this.vy = 0;
      this.force = 0;
      this.angle = 0;
      this.distance = 0;
      this.friction = Math.random() * 0.6 + 0.15;
      this.ease = Math.random() * 0.1 + 0.005;
    }

    draw() {
      this.effect.context.fillStyle = this.color;
      this.effect.context.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
      this.dx = this.effect.mouse.x - this.x;
      this.dy = this.effect.mouse.y - this.y;
      this.distance = this.dx * this.dx + this.dy * this.dy;
      this.force = -this.effect.mouse.radius / this.distance;

      if (this.distance < this.effect.mouse.radius) {
        this.angle = Math.atan2(this.dy, this.dx);
        this.vx += this.force * Math.cos(this.angle);
        this.vy += this.force * Math.sin(this.angle);
      }
      this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
      this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
    }
  }

  class Effect {
    constructor(context, canvasWidth, canvasHeight, fontSize) {
      this.context = context;
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.textX = this.canvasWidth / 2;
      this.textY = this.canvasHeight / 2;
      this.fontSize = fontSize;
      this.maxTextWidth = this.canvasWidth * 0.8;
      this.lineHeight = this.fontSize * 0.9;
      this.input = document.getElementsByTagName("input")[0];

      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.wrapText(e.target.value);
        }
      });

      this.particles = [];
      this.gap = 3;
      this.mouse = {
        radius: 20_000,
        x: 0,
        y: 0,
      };
      window.addEventListener("mousemove", (e) => {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
      });
    }

    wrapText(text) {
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      const gradient = this.context.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0.3, "red");
      gradient.addColorStop(0.5, "blue");
      gradient.addColorStop(0.7, "purple");
      this.context.font = this.fontSize + "px Arial";
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      this.context.fillStyle = gradient;

      let line = "";
      let lineCounter = 0;
      let lines = [];
      const words = text.split(" ");
      const wordsLn = words.length;
      for (let i = 0; i < wordsLn; i++) {
        const word = words[i] + " ";
        const testLine = line + word;
        if (this.context.measureText(testLine).width > this.maxTextWidth) {
          line = word;
          lineCounter++;
        } else {
          line = testLine;
        }
        lines[lineCounter] = line;
      }
      const textHeight = this.lineHeight * lineCounter;
      this.textY = canvas.height / 2 - textHeight / 2;
      lines.forEach((line, index) => {
        this.context.fillText(line, canvas.width / 2, this.textY + index * this.lineHeight);
      });
      this.convertToParticles();
    }

    convertToParticles() {
      this.particles = [];
      const pixels = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      for (let y = 0; y < this.canvasHeight; y += this.gap) {
        for (let x = 0; x < this.canvasWidth; x += this.gap) {
          const index = (y * this.canvasWidth + x) * 4;
          const alpha = pixels[index + 3];
          if (alpha > 0) {
            const red = pixels[index];
            const green = pixels[index + 1];
            const blue = pixels[index + 2];
            const color = `rgb(${red}, ${green}, ${blue})`;
            this.particles.push(new Particle(this, x, y, color));
          }
        }
      }
    }

    render() {
      this.particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
    }

    resize(width, height) {
      this.canvasWidth = width;
      this.canvasHeight = height;
      this.textX = this.canvasWidth / 2;
      this.textY = this.canvasHeight / 2;
      this.maxTextWidth = this.canvasWidth * 0.8;
      this.wrapText(this.input.value)
    }
  }

  const canvas = document.getElementsByTagName("canvas")[0];
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  const effect = new Effect(ctx, canvas.width, canvas.height, 80);
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.render();
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effect.resize(canvas.width, canvas.height)
  })
});
