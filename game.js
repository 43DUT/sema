const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gravity = 0.8;
const groundHeight = 50;
const worldWidth = 2000;
const worldHeight = canvas.height;
let currentLevel = 1;

let player;

const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

const levels = {
    1: {
        backgroundColor: '#87CEEB',
        obstacles: [
            { x: 300, y: worldHeight - groundHeight - 50, width: 50, height: 50, color: 'green' },
            { x: 600, y: worldHeight - groundHeight - 100, width: 50, height: 100, color: 'green' },
            { x: 900, y: worldHeight - groundHeight - 50, width: 50, height: 50, color: 'green' },
            { x: 1200, y: worldHeight - groundHeight - 100, width: 50, height: 100, color: 'green' },
            { x: 1500, y: worldHeight - groundHeight - 50, width: 50, height: 50, color: 'green' },
            { x: 1800, y: worldHeight - groundHeight - 100, width: 50, height: 100, color: 'green' }
        ],
        clouds: [
            { x: 100, y: 50, width: 150, height: 50 },
            { x: 500, y: 80, width: 200, height: 60 },
            { x: 800, y: 40, width: 180, height: 55 },
            { x: 1200, y: 70, width: 160, height: 45 },
            { x: 1600, y: 90, width: 170, height: 50 }
        ],
        enemies: [
            { x: 500, y: worldHeight - groundHeight - 50, width: 50, height: 50, speed: 2, direction: 1 },
            { x: 1300, y: worldHeight - groundHeight - 50, width: 50, height: 50, speed: 2, direction: 1 }
        ]
    },
    2: {
        backgroundColor: '#8B0000',
        obstacles: [
            { x: 400, y: worldHeight - groundHeight - 70, width: 50, height: 70, color: 'orange' },
            { x: 700, y: worldHeight - groundHeight - 150, width: 50, height: 150, color: 'orange' },
            { x: 1100, y: worldHeight - groundHeight - 70, width: 50, height: 70, color: 'orange' },
            { x: 1400, y: worldHeight - groundHeight - 130, width: 50, height: 130, color: 'orange' },
            { x: 1700, y: worldHeight - groundHeight - 50, width: 50, height: 50, color: 'orange' },
            { x: 1900, y: worldHeight - groundHeight - 90, width: 50, height: 90, color: 'orange' }
        ],
        clouds: [],
        enemies: [
            { x: 450, y: worldHeight - groundHeight - 50, width: 50, height: 50, speed: 3, direction: 1 },
            { x: 1000, y: worldHeight - groundHeight - 50, width: 50, height: 50, speed: 3, direction: 1 },
            { x: 1600, y: worldHeight - groundHeight - 50, width: 50, height: 50, speed: 3, direction: 1 }
        ]
    },
    3: {
        backgroundColor: '#ADD8E6',
        obstacles: [
            { x: 350, y: worldHeight - groundHeight - 60, width: 50, height: 60, color: '#00FFFF' },
            { x: 650, y: worldHeight - groundHeight - 120, width: 50, height: 120, color: '#00FFFF' },
            { x: 900, y: worldHeight - groundHeight - 60, width: 50, height: 60, color: '#00FFFF' },
            { x: 1150, y: worldHeight - groundHeight - 110, width: 50, height: 110, color: '#00FFFF' },
            { x: 1500, y: worldHeight - groundHeight - 50, width: 50, height: 50, color: '#00FFFF' },
            { x: 1700, y: worldHeight - groundHeight - 80, width: 50, height: 80, color: '#00FFFF' }
        ],
        clouds: [],
        enemies: [
            { x: 300, y: worldHeight - groundHeight - 50, width: 50, height: 50, speed: 2, direction: 1 },
            { x: 900, y: worldHeight - groundHeight - 50, width: 50, height: 50, speed: 2, direction: 1 }
        ]
    }
};

const projectiles = [];
const flag = { x: worldWidth - 100, y: worldHeight - groundHeight - 150, width: 10, height: 150 };

const keys = {
    right: false,
    left: false,
    up: false
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowUp') keys.up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowUp') keys.up = false;
});

function drawPlayer() {
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x - camera.x, player.y - camera.y, player.width, player.height);
}

function drawObstacles() {
    const level = levels[currentLevel];
    level.obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x - camera.x, obstacle.y - camera.y, obstacle.width, obstacle.height);
    });
}

function drawEnemies() {
    const level = levels[currentLevel];
    ctx.fillStyle = 'blue';
    level.enemies.forEach(enemy => {
        ctx.fillRect(enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height);
    });
}

function drawProjectiles() {
    ctx.fillStyle = 'black';
    projectiles.forEach(projectile => {
        ctx.fillRect(projectile.x - camera.x, projectile.y - camera.y, projectile.width, projectile.height);
    });
}

function drawClouds() {
    const level = levels[currentLevel];
    ctx.fillStyle = 'white';
    level.clouds.forEach(cloud => {
        ctx.fillRect(cloud.x - camera.x, cloud.y - camera.y, cloud.width, cloud.height);
    });
}

function drawGround() {
    ctx.fillStyle = 'brown';
    ctx.fillRect(0 - camera.x, worldHeight - groundHeight - camera.y, worldWidth, groundHeight);
}

function drawFlag() {
    ctx.fillStyle = 'white';
    ctx.fillRect(flag.x - camera.x, flag.y - camera.y, flag.width, flag.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(flag.x - camera.x, flag.y - camera.y, 30, 20); // Flagge oben
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

function updatePlayer() {
    if (!player.alive) return;

    player.grounded = false;

    if (keys.right) player.dx = player.speed;
    else if (keys.left) player.dx = -player.speed;
    else player.dx = 0;

    player.dy += gravity;
    player.x += player.dx;
    player.y += player.dy;

    levels[currentLevel].obstacles.forEach(obstacle => {
        if (checkCollision(player, obstacle)) {
            if (player.dy > 0 && player.y + player.height - player.dy <= obstacle.y) {
                player.y = obstacle.y - player.height;
                player.dy = 0;
                player.jumping = false;
                player.grounded = true;
                player.jumps = 0; // Reset der Sprunganzahl
            } else if (player.dy < 0 && player.y - player.dy >= obstacle.y + obstacle.height) {
                player.y = obstacle.y + obstacle.height;
                player.dy = 0;
            } else if (player.dx > 0 && player.x + player.width - player.dx <= obstacle.x) {
                player.x = obstacle.x - player.width;
            } else if (player.dx < 0 && player.x - player.dx >= obstacle.x + obstacle.width) {
                player.x = obstacle.x + obstacle.width;
            }
        }
    });

    if (player.y + player.height >= worldHeight - groundHeight) {
        player.y = worldHeight - groundHeight - player.height;
        player.dy = 0;
        player.jumping = false;
        player.grounded = true;
        player.jumps = 0; // Reset der Sprunganzahl
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > worldWidth) player.x = worldWidth - player.width;

    levels[currentLevel].enemies.forEach(enemy => {
        if (checkCollision(player, enemy)) {
            player.alive = false;
            showOverlay('Game Over');
        }
    });

    projectiles.forEach(projectile => {
        if (checkCollision(player, projectile)) {
            player.alive = false;
            showOverlay('Game Over');
        }
    });

    if (checkCollision(player, flag)) {
        player.alive = false;
        showOverlay('Level Completed!');
    }

    // Sprung-Logik
    if (keys.up) {
        if (player.jumps < 2) {
            player.dy = -15;
            player.jumps++;
            player.jumping = true;
            player.grounded = false;
        }
        keys.up = false; // Verhindert das wiederholte Springen, solange die Taste gedrückt ist
    }
}

function updateEnemies() {
    const level = levels[currentLevel];
    level.enemies.forEach(enemy => {
        enemy.x += enemy.speed * enemy.direction;

        let collisionDetected = false;
        levels[currentLevel].obstacles.forEach(obstacle => {
            if (checkCollision(enemy, obstacle)) {
                collisionDetected = true;
            }
        });

        if (collisionDetected || enemy.x < 0 || enemy.x + enemy.width > worldWidth) {
            enemy.direction *= -1;
        }
    });
}

function updateProjectiles() {
    projectiles.forEach((projectile, index) => {
        projectile.x += projectile.speed;
        if (projectile.x > worldWidth || projectile.x < 0) {
            projectiles.splice(index, 1);
        }
    });
}

function shootProjectiles() {
    const level = levels[currentLevel];
    level.enemies.forEach(enemy => {
        const projectile = {
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            width: 10,
            height: 10,
            speed: 5 * enemy.direction
        };
        projectiles.push(projectile);
    });
}

function updateCamera() {
    camera.x = Math.max(0, Math.min(player.x - camera.width / 2 + player.width / 2, worldWidth - camera.width));
    camera.y = Math.max(0, Math.min(player.y - camera.height / 2 + player.height / 2, worldHeight - camera.height));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = levels[currentLevel].backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawClouds();
    drawPlayer();
    drawObstacles();
    drawEnemies();
    drawProjectiles();
    drawFlag();
}

function initializeGame() {
    player = {
        x: 50,
        y: canvas.height - groundHeight - 50,
        width: 50,
        height: 50,
        speed: 5,
        dx: 0,
        dy: 0,
        jumping: false,
        grounded: false,
        alive: true,
        jumps: 0 // Hinzufügen der Sprunganzahl
    };
    projectiles.length = 0; // Löscht alle Projektile
    camera.x = 0;
    camera.y = 0;
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('nextLevelButton').style.display = 'none';
    document.getElementById('message').innerText = '';
    update();
}

function showOverlay(message) {
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('message').innerText = message;
    document.getElementById('restartButton').style.display = 'block';

    if (message === 'Level Completed!') {
        document.getElementById('nextLevelButton').style.display = 'block';
    } else {
        document.getElementById('nextLevelButton').style.display = 'none';
    }
}

function update() {
    updatePlayer();
    updateEnemies();
    updateProjectiles();
    updateCamera();
    draw();
    if (player.alive) {
        requestAnimationFrame(update);
    }
}

document.getElementById('restartButton').addEventListener('click', () => {
    initializeGame();
});

document.getElementById('nextLevelButton').addEventListener('click', () => {
    if (currentLevel < 3) {
        currentLevel++;
    } else {
        currentLevel = 1; // Zurück zum ersten Level
    }
    initializeGame();
});

setInterval(shootProjectiles, 2000);

initializeGame();