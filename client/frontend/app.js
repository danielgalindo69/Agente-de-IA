let chatHistory = [];

const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const submitBtn = chatForm.querySelector('button');

// Elementos del Tutorial
const tutorialOverlay = document.getElementById('tutorial-overlay');
const skipTutorialBtn = document.getElementById('skip-tutorial-btn');
const startExperienceBtn = document.getElementById('start-experience-btn');
const headerTutorialBtn = document.getElementById('header-tutorial-btn');
const nextCardButtons = document.querySelectorAll('.next-card-btn');
const exampleBox = document.getElementById('tutorial-example-box');

let wormholeAnimationId = null;
let wormholeCanvas = document.getElementById('wormhole-canvas');
let wormholeCtx = wormholeCanvas.getContext('2d');
let particles = [];
const maxParticles = 180;
let w = window.innerWidth;
let h = window.innerHeight;

// ── Mensajes del Chat ────────────────────────────────────────────────────────
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'bubble';
    
    // Si contiene viñetas o negritas de Markdown simples, las renderizamos
    if (text.includes('**') || text.includes('- ') || text.includes('\n')) {
        bubbleDiv.innerHTML = formatMarkdown(text);
    } else {
        bubbleDiv.textContent = text;
    }

    messageDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Formateador simple de Markdown para respuestas bonitas en negrita y listas
function formatMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\s*[-*]\s+(.*?)$/gm, '• $1')
        .replace(/\n/g, '<br>');
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = userInput.value.trim();
    if (!text) return;

    // Agregar mensaje del usuario a la interfaz
    addMessage(text, 'user');
    userInput.value = '';

    // Deshabilitar entradas durante la espera
    userInput.disabled = true;
    submitBtn.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: text,
                history: chatHistory
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Agregar respuesta del bot
        addMessage(data.response, 'bot');

        // Update history
        chatHistory = data.history;

    } catch (error) {
        console.error('Error fetching response:', error);
        addMessage('Lo siento, hubo un error al conectar con el servidor.', 'bot');
    } finally {
        // Habilitar entradas
        userInput.disabled = false;
        submitBtn.disabled = false;
        userInput.focus();
    }
});

// ── 🌀 Efecto de Agujero de Gusano (Canvas Starfield Vortex) ──────────────────
class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = (Math.random() - 0.5) * w;
        this.y = (Math.random() - 0.5) * h;
        this.z = Math.random() * w; // Profundidad
        this.color = `hsl(${Math.random() * 80 + 200}, 85%, 75%)`; // Azules, morados y magentas vibrantes
        this.size = Math.random() * 2 + 1;
    }
    update() {
        this.z -= 5; // Velocidad de acercamiento
        if (this.z <= 0) {
            this.reset();
        }
        // Efecto de rotación del agujero de gusano (vórtice espacial)
        const angle = 0.005;
        const rx = this.x * Math.cos(angle) - this.y * Math.sin(angle);
        const ry = this.x * Math.sin(angle) + this.y * Math.cos(angle);
        this.x = rx;
        this.y = ry;
    }
    draw() {
        const k = 300 / this.z;
        const px = this.x * k + w / 2;
        const py = this.y * k + h / 2;
        const size = this.size * k;

        if (px < 0 || px > w || py < 0 || py > h) {
            return;
        }

        wormholeCtx.beginPath();
        wormholeCtx.arc(px, py, size, 0, Math.PI * 2);
        wormholeCtx.fillStyle = this.color;
        wormholeCtx.shadowBlur = size * 2;
        wormholeCtx.shadowColor = this.color;
        wormholeCtx.fill();
        wormholeCtx.shadowBlur = 0; // Limpiar sombra para rendimiento
    }
}

function resizeWormhole() {
    w = wormholeCanvas.width = window.innerWidth;
    h = wormholeCanvas.height = window.innerHeight;
}

function initWormhole() {
    resizeWormhole();
    particles = [];
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }
}

function animateWormhole() {
    wormholeCtx.fillStyle = 'rgba(15, 23, 42, 0.18)'; // Estela espacial
    wormholeCtx.fillRect(0, 0, w, h);

    // Gradiente central del agujero de gusano
    const centerGrad = wormholeCtx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2.5);
    centerGrad.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
    centerGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.04)');
    centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    wormholeCtx.fillStyle = centerGrad;
    wormholeCtx.fillRect(0, 0, w, h);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    wormholeAnimationId = requestAnimationFrame(animateWormhole);
}

function startWormhole() {
    if (!wormholeAnimationId) {
        initWormhole();
        animateWormhole();
    }
}

function stopWormhole() {
    if (wormholeAnimationId) {
        cancelAnimationFrame(wormholeAnimationId);
        wormholeAnimationId = null;
        // Limpiar el canvas
        wormholeCtx.clearRect(0, 0, w, h);
    }
}

window.addEventListener('resize', resizeWormhole);

// ── 🎴 Animación y Rotación de Tarjetas Apiladas (3D Deck) ──────────────────
let currentFrontIndex = 0;
const totalCards = 3;

function getCardByDataIndex(idx) {
    return document.querySelector(`.tutorial-card[data-index="${idx}"]`);
}

function rotateCards() {
    const card0 = getCardByDataIndex(0);
    const card1 = getCardByDataIndex(1);
    const card2 = getCardByDataIndex(2);

    // Determinamos las posiciones relativas basadas en el índice que está al frente
    if (currentFrontIndex === 0) {
        card0.className = 'tutorial-card card-front';
        card1.className = 'tutorial-card card-middle';
        card2.className = 'tutorial-card card-back';
    } else if (currentFrontIndex === 1) {
        card1.className = 'tutorial-card card-front';
        card2.className = 'tutorial-card card-middle';
        card0.className = 'tutorial-card card-back';
    } else {
        card2.className = 'tutorial-card card-front';
        card0.className = 'tutorial-card card-middle';
        card1.className = 'tutorial-card card-back';
    }
}

function nextCard() {
    const activeCard = getCardByDataIndex(currentFrontIndex);
    
    // 1. Añadimos animación de deslizamiento (salida) a la carta del frente
    activeCard.classList.add('card-leaving');
    
    // 2. Transicionamos las clases de las cartas de atrás hacia adelante después de 150ms para fluidez
    setTimeout(() => {
        currentFrontIndex = (currentFrontIndex + 1) % totalCards;
        rotateCards();
    }, 150);
}

// Evento de clicks para botones "Siguiente"
nextCardButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextCard();
    });
});

// ── ⚙️ Controles del Tutorial ───────────────────────────────────────────────
function openTutorial() {
    currentFrontIndex = 0;
    rotateCards();
    
    // Quitar clases previas de animación
    document.querySelectorAll('.tutorial-card').forEach(card => {
        card.classList.remove('card-leaving');
    });

    document.body.classList.add('tutorial-active');
    startWormhole();
}

function closeTutorial() {
    document.body.classList.remove('tutorial-active');
    setTimeout(() => {
        stopWormhole();
    }, 500);
}

// Botones de salida del tutorial
skipTutorialBtn.addEventListener('click', () => {
    localStorage.setItem('tutorialSeen', 'true');
    closeTutorial();
});

startExperienceBtn.addEventListener('click', () => {
    localStorage.setItem('tutorialSeen', 'true');
    closeTutorial();
    // Autocompletar entrada del chat con el ejemplo
    userInput.value = "Ana (EMP001) lidero el equipo de manera increible, resolviendo tres incidentes criticos. Calcula su neto.";
    userInput.focus();
});

// Autocompletar al hacer clic directo en la caja de ejemplos
exampleBox.addEventListener('click', () => {
    localStorage.setItem('tutorialSeen', 'true');
    closeTutorial();
    userInput.value = "Ana (EMP001) lidero el equipo de manera increible, resolviendo tres incidentes criticos. Calcula su neto.";
    userInput.focus();
});

// Abrir tutorial desde el botón de la cabecera
headerTutorialBtn.addEventListener('click', () => {
    openTutorial();
});

// Inicialización: auto-activar tutorial en la primera visita
window.addEventListener('DOMContentLoaded', () => {
    const seen = localStorage.getItem('tutorialSeen');
    if (!seen) {
        // Pequeño retardo para dar efecto dramático al cargar
        setTimeout(() => {
            openTutorial();
        }, 800);
    }
});

// ── ✨ Sistema de Estrellas Explosivas en Mousemove (Exclusivo fuera del chat) ──
const particlesCanvas = document.getElementById('particles-canvas');
const particlesCtx = particlesCanvas.getContext('2d');
let explParticles = [];
const maxExplParticles = 120;
let pw = window.innerWidth;
let ph = window.innerHeight;

class StarParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // Velocidad y dirección explosiva aleatoria
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.04; // Gravedad ligera para caída
        this.resistance = 0.97; // Fricción del aire
        
        // Atributos visuales
        this.spikes = 5;
        this.outerRadius = Math.random() * 8 + 5;
        this.innerRadius = this.outerRadius / 2;
        this.color = `hsl(${Math.random() * 360}, 90%, 65%)`; // Colores neón súper vibrantes
        this.age = 0;
        this.maxAge = 120; // 2 segundos a 60 FPS
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    }
    update() {
        // Actualizar velocidad con fricción y gravedad
        this.vx *= this.resistance;
        this.vy = (this.vy + this.gravity) * this.resistance;
        
        // Actualizar posición
        this.x += this.vx;
        this.y += this.vy;
        
        // Rotación
        this.rotation += this.rotationSpeed;
        
        this.age++;
    }
    draw() {
        const opacity = 1 - (this.age / this.maxAge);
        if (opacity <= 0) return;

        let rot = this.rotation;
        let x = this.x;
        let y = this.y;
        let step = Math.PI / this.spikes;

        particlesCtx.save();
        particlesCtx.globalAlpha = opacity;
        particlesCtx.shadowBlur = 10;
        particlesCtx.shadowColor = this.color;
        
        particlesCtx.beginPath();
        particlesCtx.moveTo(this.x, this.y - this.outerRadius);
        
        for (let i = 0; i < this.spikes; i++) {
            x = this.x + Math.cos(rot) * this.outerRadius;
            y = this.y + Math.sin(rot) * this.outerRadius;
            particlesCtx.lineTo(x, y);
            rot += step;

            x = this.x + Math.cos(rot) * this.innerRadius;
            y = this.y + Math.sin(rot) * this.innerRadius;
            particlesCtx.lineTo(x, y);
            rot += step;
        }
        
        particlesCtx.lineTo(this.x, this.y - this.outerRadius);
        particlesCtx.closePath();
        
        particlesCtx.fillStyle = this.color;
        particlesCtx.fill();
        particlesCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        particlesCtx.lineWidth = 0.5;
        particlesCtx.stroke();
        
        particlesCtx.restore();
    }
}

function resizeParticlesCanvas() {
    pw = particlesCanvas.width = window.innerWidth;
    ph = particlesCanvas.height = window.innerHeight;
}

function spawnStars(mx, my) {
    // Genera 2 o 3 estrellas por cada movimiento del mouse para control de rendimiento
    const count = Math.random() < 0.4 ? 2 : 1;
    for (let i = 0; i < count; i++) {
        if (explParticles.length < maxExplParticles) {
            explParticles.push(new StarParticle(mx, my));
        }
    }
}

function animateParticles() {
    particlesCtx.clearRect(0, 0, pw, ph);
    
    // Filtrar estrellas vivas y dibujar
    explParticles = explParticles.filter(p => p.age < p.maxAge);
    explParticles.forEach(p => {
        p.update();
        p.draw();
    });
    
    requestAnimationFrame(animateParticles);
}

// Iniciar bucle de render de estrellas
resizeParticlesCanvas();
window.addEventListener('resize', resizeParticlesCanvas);
requestAnimationFrame(animateParticles);

// Escuchar movimiento del cursor fuera del chat-container y fuera del tutorial deck
const chatWrapper = document.querySelector('.chat-wrapper');

window.addEventListener('mousemove', (e) => {
    // Verificar si el cursor está dentro del chat
    const isOverChat = chatWrapper.contains(e.target);
    
    // Verificar si el cursor está sobre las cartas del tutorial
    const isOverTutorial = e.target.closest('.tutorial-deck-container');
    
    if (!isOverChat && !isOverTutorial) {
        spawnStars(e.clientX, e.clientY);
    }
});
