document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const body = document.body;
const aura = document.querySelector(".cursor-aura");
const canvas = document.getElementById("agent-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const heroScene = document.querySelector(".hero");
const railFill = document.querySelector(".rail-fill");
const railCurrent = document.querySelector(".rail-current");
const railIndex = document.querySelector(".rail-index");
const scenes = [...document.querySelectorAll(".scroll-scene")];
const navLinks = [...document.querySelectorAll(".site-nav a")];

let pointer = { x: window.innerWidth * 0.66, y: window.innerHeight * 0.38, active: false };
let nodes = [];
let rafId = 0;
let scrollTicking = false;
let canvasActive = false;
let lastCanvasFrame = 0;

function setViewportVars() {
  const scrollTop = window.scrollY;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pageProgress = Math.min(1, Math.max(0, scrollTop / maxScroll));
  root.style.setProperty("--scroll-y", String(scrollTop));
  root.style.setProperty("--scroll-progress", pageProgress.toFixed(4));

  let activeScene = scenes[0];
  let activeDistance = Number.POSITIVE_INFINITY;

  for (const scene of scenes) {
    const rect = scene.getBoundingClientRect();
    const travel = Math.max(1, rect.height + window.innerHeight);
    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / travel));
    scene.style.setProperty("--scene-progress", progress.toFixed(4));

    const centerDistance = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
    if (!activeScene || centerDistance < activeDistance) {
      activeScene = scene;
      activeDistance = centerDistance;
    }
  }

  if (activeScene) {
    const sceneName = activeScene.dataset.scene || "Scene";
    const sceneNumber = `${String(scenes.indexOf(activeScene) + 1).padStart(2, "0")}`;
    if (railCurrent) railCurrent.textContent = sceneName;
    if (railIndex) railIndex.textContent = sceneNumber;
    navLinks.forEach(link => {
      const target = link.getAttribute("href")?.slice(1);
      link.classList.toggle("active", target === activeScene.id);
    });
  }

  if (railFill) railFill.style.height = `${pageProgress * 100}%`;
}

function requestScrollUpdate() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    setViewportVars();
    scrollTicking = false;
  });
}

function handlePointer(event) {
  pointer = { x: event.clientX, y: event.clientY, active: true };
  root.style.setProperty("--mx", `${event.clientX}px`);
  root.style.setProperty("--my", `${event.clientY}px`);
}

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const nodeCount = window.innerWidth < 720 ? 18 : window.innerWidth < 1100 ? 30 : 42;
  nodes = Array.from({ length: nodeCount }, (_, index) => {
    const band = index % 3;
    return {
      x: window.innerWidth * (0.45 + Math.random() * 0.46),
      y: window.innerHeight * (0.12 + Math.random() * 0.48 + band * 0.04),
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.22,
      r: 1.4 + Math.random() * 2.8,
      hue: index % 9 === 0 ? "255, 64, 85" : index % 5 === 0 ? "61, 242, 154" : "39, 199, 255"
    };
  });
}

function drawAgentCanvas(timestamp = 0) {
  rafId = 0;
  if (!ctx || !canvas || prefersReducedMotion || !canvasActive) return;

  const targetFrameMs = window.innerWidth < 720 ? 66 : 33;
  if (timestamp - lastCanvasFrame < targetFrameMs) {
    rafId = requestAnimationFrame(drawAgentCanvas);
    return;
  }
  lastCanvasFrame = timestamp;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.lineWidth = 1;

  for (const node of nodes) {
    const dx = node.x - pointer.x;
    const dy = node.y - pointer.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (pointer.active && dist < 180) {
      node.vx += (dx / dist) * 0.018;
      node.vy += (dy / dist) * 0.018;
    }

    node.x += node.vx;
    node.y += node.vy + Math.sin(Date.now() * 0.0007 + node.x) * 0.02;
    node.vx *= 0.992;
    node.vy *= 0.992;

    const minX = window.innerWidth * 0.36;
    const maxX = window.innerWidth * 0.96;
    const minY = window.innerHeight * 0.08;
    const maxY = window.innerHeight * 0.68;

    if (node.x < minX || node.x > maxX) node.vx *= -1;
    if (node.y < minY || node.y > maxY) node.vy *= -1;
    node.x = Math.max(minX, Math.min(maxX, node.x));
    node.y = Math.max(minY, Math.min(maxY, node.y));
  }

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 132) {
        const alpha = (1 - dist / 132) * 0.32;
        ctx.strokeStyle = `rgba(${a.hue}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (const node of nodes) {
    ctx.fillStyle = `rgba(${node.hue}, .85)`;
    ctx.shadowColor = `rgba(${node.hue}, .9)`;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  rafId = requestAnimationFrame(drawAgentCanvas);
}

function startCanvas() {
  if (!ctx || prefersReducedMotion || rafId) return;
  canvasActive = true;
  rafId = requestAnimationFrame(drawAgentCanvas);
}

function stopCanvas() {
  canvasActive = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

function setupCanvasVisibility() {
  if (!heroScene || !ctx || prefersReducedMotion) return;
  const observer = new IntersectionObserver(
    entries => {
      const isVisible = entries.some(entry => entry.isIntersecting);
      if (isVisible) {
        startCanvas();
      } else {
        stopCanvas();
      }
    },
    { threshold: 0.02 }
  );
  observer.observe(heroScene);
}

function setupRevealObserver() {
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  reveals.forEach(item => observer.observe(item));
}

function setupModeButtons() {
  const modeCopy = document.getElementById("mode-copy");
  const copy = {
    agent: "Agent route planning: calm, precise, and ready to accelerate.",
    road: "Road mode: redline focus, telemetry, night drives, and fast feedback loops.",
    studio: "Studio mode: rhythm, spectrum, structure, and signal hidden inside sound."
  };

  document.querySelectorAll(".mode-button").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".mode-button").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      const mode = button.dataset.mode;
      body.classList.toggle("mode-road", mode === "road");
      body.classList.toggle("mode-studio", mode === "studio");
      if (modeCopy) modeCopy.textContent = copy[mode] || copy.agent;
    });
  });
}

for (const [index, tile] of document.querySelectorAll(".input-grid span").entries()) {
  tile.style.setProperty("--i", index + 1);
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("pointermove", handlePointer, { passive: true });
window.addEventListener("resize", () => {
  resizeCanvas();
  setViewportVars();
});

setViewportVars();
setupRevealObserver();
setupModeButtons();
resizeCanvas();
setupCanvasVisibility();

if (prefersReducedMotion && aura) {
  aura.style.display = "none";
}
