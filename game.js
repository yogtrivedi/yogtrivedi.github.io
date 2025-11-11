// Hidden Game - Defend Earth
let gameActive = false;
let gameCanvas, gameCtx;
let player, asteroids, bullets, particles;
let gameScore, gameSkills, gameLives;
let keysPressed = {};
let unlockedSkills = [];

// Yog's skills to unlock
const SKILLS = [
    'Java', 'Python', 'C', 'R', 'Next.js', 'TensorFlow.js',
    'Machine Learning', 'Data Science', 'Hackathon Winner',
    'Research', 'First Degree Black Belt', 'Leadership'
];

// Konami Code Easter Egg
function initKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
                        'KeyB', 'KeyA'];
    let konamiIndex = 0;
    const hint = document.getElementById('konamiHint');
    
    // Show hint after 30 seconds
    setTimeout(() => {
        if (hint) {
            hint.classList.add('show');
            setTimeout(() => hint.classList.remove('show'), 5000);
        }
    }, 30000);
    
    document.addEventListener('keydown', (e) => {
        if (e.code === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                konamiIndex = 0;
                activateGame();
                if (hint) hint.classList.add('hide');
            }
        } else {
            konamiIndex = 0;
        }
    });
}

function activateGame() {
    const gameOverlay = document.getElementById('gameOverlay');
    if (gameOverlay) {
        gameOverlay.classList.add('active');
        initGame();
    }
}

function initGame() {
    gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas) return;
    
    gameCtx = gameCanvas.getContext('2d');
    gameCanvas.width = 800;
    gameCanvas.height = 600;
    
    // Initialize game objects
    player = {
        x: gameCanvas.width / 2,
        y: gameCanvas.height - 60,
        width: 40,
        height: 40,
        speed: 5,
        color: '#667eea'
    };
    
    asteroids = [];
    bullets = [];
    particles = [];
    unlockedSkills = [];
    
    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    const startBtn = document.getElementById('gameStartBtn');
    const closeBtn = document.getElementById('gameClose');
    const restartBtn = document.getElementById('gameRestartBtn');
    
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeGame);
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
}

function startGame() {
    const startScreen = document.getElementById('gameStartScreen');
    if (startScreen) startScreen.style.display = 'none';
    
    gameActive = true;
    gameScore = 0;
    gameSkills = 0;
    gameLives = 3;
    unlockedSkills = [];
    asteroids = [];
    bullets = [];
    particles = [];
    
    updateHUD();
    gameLoop();
}

function closeGame() {
    gameActive = false;
    const gameOverlay = document.getElementById('gameOverlay');
    if (gameOverlay) gameOverlay.classList.remove('active');
    
    const startScreen = document.getElementById('gameStartScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (startScreen) startScreen.style.display = 'flex';
    if (gameOverScreen) gameOverScreen.classList.remove('active');
}

function restartGame() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (gameOverScreen) gameOverScreen.classList.remove('active');
    startGame();
}

function handleKeyDown(e) {
    keysPressed[e.code] = true;
    
    if (gameActive && e.code === 'Space') {
        e.preventDefault();
        shootBullet();
    }
}

function handleKeyUp(e) {
    keysPressed[e.code] = false;
}

function shootBullet() {
    bullets.push({
        x: player.x + player.width / 2,
        y: player.y,
        width: 4,
        height: 15,
        speed: 8,
        color: '#00ff00'
    });
}

function spawnAsteroid() {
    const size = 30 + Math.random() * 40;
    asteroids.push({
        x: Math.random() * (gameCanvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: 1 + Math.random() * 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
        skill: SKILLS[Math.floor(Math.random() * SKILLS.length)]
    });
}

function createParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1,
            color
        });
    }
}

function updateGame() {
    // Move player
    if (keysPressed['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keysPressed['ArrowRight'] && player.x < gameCanvas.width - player.width) {
        player.x += player.speed;
    }
    
    // Update bullets
    bullets = bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > 0;
    });
    
    // Update asteroids
    asteroids.forEach((asteroid, i) => {
        asteroid.y += asteroid.speed;
        asteroid.rotation += asteroid.rotationSpeed;
        
        // Check collision with player
        if (checkCollision(player, asteroid)) {
            gameLives--;
            updateHUD();
            asteroids.splice(i, 1);
            createParticles(asteroid.x, asteroid.y, '#ff0000');
            
            if (gameLives <= 0) {
                endGame();
            }
        }
    });
    
    // Remove asteroids that went off screen
    asteroids = asteroids.filter(asteroid => asteroid.y < gameCanvas.height);
    
    // Check bullet-asteroid collisions
    bullets.forEach((bullet, bi) => {
        asteroids.forEach((asteroid, ai) => {
            if (checkCollision(bullet, asteroid)) {
                gameScore += 100;
                
                // Unlock skill
                if (!unlockedSkills.includes(asteroid.skill)) {
                    unlockedSkills.push(asteroid.skill);
                    gameSkills++;
                }
                
                updateHUD();
                createParticles(asteroid.x, asteroid.y, '#00ff00');
                asteroids.splice(ai, 1);
                bullets.splice(bi, 1);
            }
        });
    });
    
    // Update particles
    particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
    });
    particles = particles.filter(p => p.life > 0);
    
    // Spawn asteroids
    if (Math.random() < 0.02) {
        spawnAsteroid();
    }
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function drawGame() {
    // Clear canvas
    gameCtx.fillStyle = '#000428';
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Draw stars
    gameCtx.fillStyle = 'white';
    for (let i = 0; i < 50; i++) {
        const x = (i * 137.508) % gameCanvas.width;
        const y = (i * 73.123) % gameCanvas.height;
        gameCtx.fillRect(x, y, 2, 2);
    }
    
    // Draw player (spaceship)
    gameCtx.save();
    gameCtx.translate(player.x + player.width / 2, player.y + player.height / 2);
    gameCtx.fillStyle = player.color;
    gameCtx.beginPath();
    gameCtx.moveTo(0, -player.height / 2);
    gameCtx.lineTo(-player.width / 2, player.height / 2);
    gameCtx.lineTo(player.width / 2, player.height / 2);
    gameCtx.closePath();
    gameCtx.fill();
    
    // Engine glow
    gameCtx.fillStyle = '#ff6600';
    gameCtx.beginPath();
    gameCtx.arc(0, player.height / 2, 5, 0, Math.PI * 2);
    gameCtx.fill();
    gameCtx.restore();
    
    // Draw bullets
    bullets.forEach(bullet => {
        gameCtx.fillStyle = bullet.color;
        gameCtx.shadowBlur = 10;
        gameCtx.shadowColor = bullet.color;
        gameCtx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
        gameCtx.shadowBlur = 0;
    });
    
    // Draw asteroids
    asteroids.forEach(asteroid => {
        gameCtx.save();
        gameCtx.translate(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);
        gameCtx.rotate(asteroid.rotation * Math.PI / 180);
        
        // Draw irregular asteroid shape
        gameCtx.fillStyle = '#8b4513';
        gameCtx.strokeStyle = '#654321';
        gameCtx.lineWidth = 2;
        gameCtx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = (asteroid.width / 2) * (0.8 + Math.random() * 0.4);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) gameCtx.moveTo(x, y);
            else gameCtx.lineTo(x, y);
        }
        gameCtx.closePath();
        gameCtx.fill();
        gameCtx.stroke();
        
        // Draw skill label
        gameCtx.fillStyle = 'white';
        gameCtx.font = '10px Orbitron';
        gameCtx.textAlign = 'center';
        gameCtx.fillText(asteroid.skill, 0, 0);
        
        gameCtx.restore();
    });
    
    // Draw particles
    particles.forEach(particle => {
        gameCtx.globalAlpha = particle.life;
        gameCtx.fillStyle = particle.color;
        gameCtx.fillRect(particle.x, particle.y, 3, 3);
    });
    gameCtx.globalAlpha = 1;
}

function updateHUD() {
    const scoreEl = document.getElementById('gameScore');
    const skillsEl = document.getElementById('gameSkills');
    const livesEl = document.getElementById('gameLives');
    
    if (scoreEl) scoreEl.textContent = gameScore;
    if (skillsEl) skillsEl.textContent = gameSkills;
    if (livesEl) livesEl.textContent = gameLives;
}

function endGame() {
    gameActive = false;
    
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScoreEl = document.getElementById('finalScore');
    const unlockedSkillsDisplay = document.getElementById('unlockedSkillsDisplay');
    
    if (finalScoreEl) finalScoreEl.textContent = gameScore;
    
    if (unlockedSkillsDisplay) {
        unlockedSkillsDisplay.innerHTML = `
            <h3>Skills Unlocked: ${unlockedSkills.length}/${SKILLS.length}</h3>
            <div>
                ${unlockedSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        `;
    }
    
    if (gameOverScreen) gameOverScreen.classList.add('active');
}

function gameLoop() {
    if (!gameActive) return;
    
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    initKonamiCode();
    
    // Add click handler for game launch button
    const gameLaunchBtn = document.getElementById('gameLaunchBtn');
    if (gameLaunchBtn) {
        gameLaunchBtn.addEventListener('click', activateGame);
    }
});
