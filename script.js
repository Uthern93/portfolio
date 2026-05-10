const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const heroSection = document.querySelector("#home");
const backTopButton = document.querySelector("[data-back-top]");
const revealSections = [...document.querySelectorAll("main > section")];
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
const profileCard = document.querySelector("[data-profile-card]");
const cardFlipButtons = [...document.querySelectorAll("[data-card-flip]")];

cardFlipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!profileCard) return;

    const isFlipped = profileCard.classList.toggle("is-flipped");
    cardFlipButtons.forEach((flipButton) => {
      flipButton.setAttribute("aria-expanded", String(isFlipped));
    });
  });
});

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
const context = canvas ? canvas.getContext("2d") : null;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const editorLines = [
  { indent: 0, text: "const solve = async (problem) => {", color: "#1B5448" },
  { indent: 1, text: "const workflow = mapNeeds(problem);", color: "#65716e" },
  { indent: 1, text: "const system = build(workflow);", color: "#65716e" },
  { indent: 1, text: "return ship(system);", color: "#c7a047" },
  { indent: 0, text: "};", color: "#1B5448" },
];

const floatingSnippets = [
  { x: 0.18, y: 0.24, text: "<ui />", delay: 0 },
  { x: 0.76, y: 0.22, text: "api.ok", delay: 1.2 },
  { x: 0.22, y: 0.78, text: "git push", delay: 2.4 },
  { x: 0.78, y: 0.75, text: "deploy()", delay: 3.6 },
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

const drawEditor = (time) => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const cardWidth = Math.min(430, width * 0.78);
  const cardHeight = Math.min(270, height * 0.62);
  const x = width / 2 - cardWidth / 2;
  const y = height / 2 - cardHeight / 2 + (reduceMotion ? 0 : Math.sin(time / 1300) * 4);

  roundedRect(x - 12, y - 12, cardWidth + 24, cardHeight + 24, 28);
  context.fillStyle = "rgba(27, 84, 72, 0.07)";
  context.fill();

  roundedRect(x, y, cardWidth, cardHeight, 22);
  context.fillStyle = "rgba(255, 255, 255, 0.9)";
  context.fill();
  context.lineWidth = 1.5;
  context.strokeStyle = "rgba(27, 84, 72, 0.16)";
  context.stroke();

  ["#ff6b6b", "#c7a047", "#57c785"].forEach((color, index) => {
    context.beginPath();
    context.arc(x + 24 + index * 18, y + 25, 5, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
  });

  context.fillStyle = "#65716e";
  context.font = "700 11px JetBrains Mono, Consolas, monospace";
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText("developer-workspace.js", x + 88, y + 25);

  editorLines.forEach((line, index) => {
    const visible = reduceMotion ? editorLines.length : Math.min(editorLines.length, Math.floor((time / 520) % 8));
    if (index > visible) return;

    const lineY = y + 70 + index * 28;
    context.fillStyle = "rgba(27, 84, 72, 0.22)";
    context.font = "600 12px JetBrains Mono, Consolas, monospace";
    context.fillText(String(index + 1).padStart(2, "0"), x + 24, lineY);

    context.fillStyle = line.color;
    context.font = "700 13px JetBrains Mono, Consolas, monospace";
    context.fillText(`${"  ".repeat(line.indent)}${line.text}`, x + 62, lineY);
  });

  const terminalY = y + cardHeight - 58;
  roundedRect(x + 22, terminalY, cardWidth - 44, 34, 12);
  context.fillStyle = "rgba(16, 53, 46, 0.92)";
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "700 12px JetBrains Mono, Consolas, monospace";
  const cursor = Math.floor(time / 450) % 2 === 0 ? "_" : "";
  context.fillText(`> npm run build ${cursor}`, x + 40, terminalY + 18);
};

const drawSnippet = (snippet, time) => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const drift = reduceMotion ? 0 : Math.sin(time / 900 + snippet.delay) * 10;
  const x = snippet.x * width;
  const y = snippet.y * height + drift;
  const pillWidth = Math.max(88, context.measureText(snippet.text).width + 30);

  roundedRect(x - pillWidth / 2, y - 17, pillWidth, 34, 12);
  context.fillStyle = "rgba(255, 255, 255, 0.78)";
  context.fill();
  context.lineWidth = 1.2;
  context.strokeStyle = "rgba(27, 84, 72, 0.16)";
  context.stroke();

  context.fillStyle = "#1B5448";
  context.font = "800 11px JetBrains Mono, Consolas, monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(snippet.text, x, y + 1);
};

const draw = (time = 0) => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  context.clearRect(0, 0, width, height);

  context.fillStyle = "rgba(27, 84, 72, 0.045)";
  for (let x = 28; x < width; x += 44) {
    for (let y = 28; y < height; y += 44) {
      context.beginPath();
      context.arc(x, y, 1.4, 0, Math.PI * 2);
      context.fill();
    }
  }

  floatingSnippets.forEach((snippet) => drawSnippet(snippet, time));
  drawEditor(time);

  if (!reduceMotion) {
    requestAnimationFrame(draw);
  }
};

if (canvas && context) {
  resizeCanvas();
  draw();
  window.addEventListener("resize", () => {
    resizeCanvas();
    draw();
  });
}
