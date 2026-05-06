const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const heroSection = document.querySelector("#home");
const backTopButton = document.querySelector("[data-back-top]");
const revealSections = [
  ...document.querySelectorAll("main > section"),
  document.querySelector(".site-footer"),
].filter(Boolean);
const navLinks = [...document.querySelectorAll(".site-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);

  if (heroSection && backTopButton) {
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    backTopButton.classList.toggle("is-visible", window.scrollY > heroBottom - 80);
  }
};

const closeNav = () => {
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
};

navToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeNav);
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle(
        "is-active",
        link.getAttribute("href") === `#${visible.target.id}`
      );
    });
  },
  {
    rootMargin: "-25% 0px -55% 0px",
    threshold: [0.15, 0.3, 0.6],
  }
);

sections.forEach((section) => observer.observe(section));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  },
  {
    rootMargin: "-8% 0px -12% 0px",
    threshold: 0.16,
  }
);

revealSections.forEach((section) => {
  section.classList.add("reveal-section");
  revealObserver.observe(section);
});

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

const cursorRing = document.querySelector("[data-cursor-ring]");
const supportsCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (cursorRing && supportsCustomCursor) {
  const cursor = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
  };

  const moveCursor = () => {
    cursor.x += (cursor.targetX - cursor.x) * 0.18;
    cursor.y += (cursor.targetY - cursor.y) * 0.18;
    cursorRing.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(moveCursor);
  };

  window.addEventListener("pointermove", (event) => {
    cursor.targetX = event.clientX;
    cursor.targetY = event.clientY;
    cursorRing.classList.add("is-visible");
  });

  document.addEventListener("pointerover", (event) => {
    cursorRing.classList.toggle("is-hovering", Boolean(event.target.closest("a, button")));
  });

  document.addEventListener("pointerleave", () => {
    cursorRing.classList.remove("is-visible");
  });

  moveCursor();
}

const canvas = document.getElementById("systemCanvas");
const context = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const glowShapes = [
  { x: 0.24, y: 0.31, r: 86, color: "rgba(87, 199, 133, 0.26)", speed: 1100 },
  { x: 0.72, y: 0.24, r: 118, color: "rgba(27, 84, 72, 0.18)", speed: 1350 },
  { x: 0.62, y: 0.72, r: 96, color: "rgba(199, 160, 71, 0.16)", speed: 1250 },
  { x: 0.29, y: 0.78, r: 72, color: "rgba(230, 227, 227, 0.5)", speed: 1000 },
];

const floatingDots = [
  { x: 0.18, y: 0.46, r: 4.5, delay: 0 },
  { x: 0.35, y: 0.2, r: 3.5, delay: 1.4 },
  { x: 0.53, y: 0.36, r: 5.2, delay: 2.2 },
  { x: 0.76, y: 0.48, r: 4, delay: 3.2 },
  { x: 0.47, y: 0.76, r: 3.8, delay: 4.3 },
  { x: 0.82, y: 0.72, r: 5, delay: 5.1 },
];

const resizeCanvas = () => {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * scale));
  canvas.height = Math.max(1, Math.floor(rect.height * scale));
  context.setTransform(scale, 0, 0, scale, 0, 0);
};

const roundedRect = (x, y, width, height, radius) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
};

const drawGlow = (x, y, radius, color) => {
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();
};

const drawWave = (time, offset, alpha) => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const amplitude = height * 0.035;
  const baseline = height * offset;

  context.beginPath();
  context.moveTo(-20, baseline);

  for (let x = -20; x <= width + 20; x += 28) {
    const y = baseline + Math.sin(x / 72 + time / 1400) * amplitude;
    context.lineTo(x, y);
  }

  context.strokeStyle = `rgba(27, 84, 72, ${alpha})`;
  context.lineWidth = 1.5;
  context.stroke();
};

const drawOutcomeCard = (time) => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const cardWidth = Math.min(220, width * 0.48);
  const cardHeight = 96;
  const x = width / 2 - cardWidth / 2;
  const y = height / 2 - cardHeight / 2 + (reduceMotion ? 0 : Math.sin(time / 1300) * 5);

  roundedRect(x - 10, y - 10, cardWidth + 20, cardHeight + 20, 26);
  context.fillStyle = "rgba(27, 84, 72, 0.06)";
  context.fill();

  roundedRect(x, y, cardWidth, cardHeight, 20);
  context.fillStyle = "rgba(255, 255, 255, 0.82)";
  context.fill();
  context.lineWidth = 1.5;
  context.strokeStyle = "rgba(255, 255, 255, 0.84)";
  context.stroke();

  context.fillStyle = "#1B5448";
  context.font = "800 15px Plus Jakarta Sans, Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("Solve. Build. Improve.", width / 2, y + 36);

  context.fillStyle = "#65716e";
  context.font = "700 11px Plus Jakarta Sans, Arial, sans-serif";
  context.fillText("Business-focused digital solutions", width / 2, y + 61);
};

const draw = (time = 0) => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  context.clearRect(0, 0, width, height);

  glowShapes.forEach((shape, index) => {
    const movement = reduceMotion ? 0 : Math.sin(time / shape.speed + index) * 18;
    drawGlow(
      shape.x * width + movement,
      shape.y * height + movement * 0.45,
      shape.r,
      shape.color
    );
  });

  drawWave(time, 0.34, 0.08);
  drawWave(time + 600, 0.56, 0.1);
  drawWave(time + 1200, 0.72, 0.07);

  context.beginPath();
  context.ellipse(width / 2, height / 2, width * 0.31, height * 0.22, -0.25, 0, Math.PI * 2);
  context.strokeStyle = "rgba(27, 84, 72, 0.14)";
  context.lineWidth = 1.5;
  context.stroke();

  context.beginPath();
  context.ellipse(width / 2, height / 2, width * 0.22, height * 0.31, 0.55, 0, Math.PI * 2);
  context.strokeStyle = "rgba(199, 160, 71, 0.16)";
  context.stroke();

  floatingDots.forEach((dot, index) => {
    const drift = reduceMotion ? 0 : Math.sin(time / 900 + dot.delay) * 14;
    const x = dot.x * width + drift;
    const y = dot.y * height + Math.cos(time / 1000 + dot.delay) * 10;

    context.beginPath();
    context.arc(x, y, dot.r + 7, 0, Math.PI * 2);
    context.fillStyle = "rgba(27, 84, 72, 0.06)";
    context.fill();

    context.beginPath();
    context.arc(x, y, dot.r, 0, Math.PI * 2);
    context.fillStyle = index % 2 === 0 ? "#1B5448" : "#c7a047";
    context.fill();
  });

  drawOutcomeCard(time);

  if (!reduceMotion) {
    requestAnimationFrame(draw);
  }
};

resizeCanvas();
draw();
window.addEventListener("resize", () => {
  resizeCanvas();
  draw();
});
