/* =================================
   1. CANVAS SETUP
================================= */

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const WIDTH = 480;
const HEIGHT = 270;

let frameCount = 0;


/* =================================
   2. GAME PHYSICS
================================= */

const GRAVITY = 0.35;
const JUMP_POWER = -7.5;
const MOVE_SPEED = 2.5;

const GROUND_Y = 195;
const SPRITE_HEIGHT = 48;
const SPRITE_WIDTH = 32;


/* =================================
   3. CHARACTER DATA
================================= */

const player = {
    x: 105,
    y: GROUND_Y - SPRITE_HEIGHT,

    velocityX: 0,
    velocityY: 0,

    facing: 1,

    isJumping: false,
    isGrounded: true
};

const enemy = {
    x: 345,
    y: GROUND_Y - SPRITE_HEIGHT,

    velocityX: 0,
    velocityY: 0,

    facing: -1,

    isJumping: false,
    isGrounded: true
};

/* =================================
   3.1 COMBAT VARIABLES
================================= */

let playerHealth = 100;
let enemyHealth = 100;

/* =================================
   PHASE 9D - MATCH STATE
================================= */

let gameOver = false;
let matchWinner = "";
document.getElementById("rematch-button").hidden = true;


let roundState = "ready";
let roundIntroTimer = 0;

const READY_DURATION = 60;
const FIGHT_DURATION = 45;

let roundIntroShakeTimer = 0;
const ROUND_INTRO_SHAKE_DURATION = 8;
const ROUND_INTRO_SHAKE_INTENSITY = 4;

const ATTACK_DAMAGE = 5;
const ATTACK_RANGE = 65;
const ATTACK_COOLDOWN = 25;

let playerAttackCooldown = 0;
let enemyHitFlash = 0;
let playerHitFlash = 0;

// PLAYER ATTACK ANIMATION
let playerAttackAnimation = 0;
const PLAYER_PUNCH_DURATION = 16;

// ENEMY ATTACK SETTINGS
let enemyAttackCooldown = 0;

const ENEMY_ATTACK_DAMAGE = 5;
const ENEMY_ATTACK_RANGE = 55;
const ENEMY_ATTACK_COOLDOWN = 90;

// ENEMY ATTACK PREPARATION
let enemyAttackWindup = 0;

const ENEMY_ATTACK_WINDUP = 20;

// ENEMY ATTACK ANIMATION
let enemyAttackAnimation = 0;

const ENEMY_PUNCH_DURATION = 16;

// COMBO SYSTEM
let comboCount = 0;
let comboTimer = 0;

const COMBO_WINDOW = 90;

// SCREEN SHAKE
let screenShakeTimer = 0;

const SCREEN_SHAKE_DURATION = 8;
const SCREEN_SHAKE_INTENSITY = 3;

// HIT STOP
let hitStopTimer = 0;
const HIT_STOP_DURATION = 10;

/* =================================
   PHASE 9C - HIT SPARKS
================================= */

let hitSparks = [];

const HIT_SPARK_DURATION = 12;

// HIT REACTIONS
let playerHitStun = 0;
let enemyHitStun = 0;

let playerKnockback = 0;
let enemyKnockback = 0;

const HIT_STUN_DURATION = 12;
const KNOCKBACK_FORCE = 5;
const KNOCKBACK_FRICTION = 0.75;

// ENEMY AI SETTINGS
const ENEMY_MOVE_SPEED = 1.3;
const ENEMY_STOP_DISTANCE = 48;


/* =================================
   3.2 HEALTH BAR FUNCTION
================================= */

function updateHealthBars() {

    
    
    document.getElementById("player-health").style.width =
        playerHealth + "%";

    document.getElementById("enemy-health").style.width =
        enemyHealth + "%";

}

/* =================================
   PHASE 9D - K.O. DETECTION
================================= */

function checkKnockout() {

    if (gameOver) return;

    if (enemyHealth <= 0) {
        enemyHealth = 0;
        screenShakeTimer = 0;
        gameOver = true;
        matchWinner = "GOKU";
    }

    else if (playerHealth <= 0) {
        playerHealth = 0;
        screenShakeTimer = 0;
        gameOver = true;
        matchWinner = "KRILLIN";
    }

    if (gameOver) {
    document.getElementById("rematch-button").hidden = false;
    }

}


function updateRoundIntro() {

    if (roundState === "ready") {
        roundIntroTimer++;

        if (roundIntroTimer >= READY_DURATION) {
            roundState = "fight";
            roundIntroTimer = 0;
        }
    }

    else if (roundState === "fight") {
        roundIntroTimer++;

        if (roundIntroTimer >= FIGHT_DURATION) {
            roundState = "playing";
            roundIntroTimer = 0;
        }
    }

}


/* =================================
   PHASE 9E - RESET MATCH
================================= */

function resetMatch() {

    // RESET HEALTH
    playerHealth = 100;
    enemyHealth = 100;

    // RESET PLAYER POSITION
    player.x = 105;
    player.y = GROUND_Y - SPRITE_HEIGHT;
    player.velocityX = 0;
    player.velocityY = 0;
    player.facing = 1;
    player.isJumping = false;
    player.isGrounded = true;

    // RESET ENEMY POSITION
    enemy.x = 345;
    enemy.y = GROUND_Y - SPRITE_HEIGHT;
    enemy.velocityX = 0;
    enemy.velocityY = 0;
    enemy.facing = -1;
    enemy.isJumping = false;
    enemy.isGrounded = true;

    // RESET ATTACKS
    playerAttackCooldown = 0;
    enemyAttackCooldown = 0;
    playerAttackAnimation = 0;
    enemyAttackAnimation = 0;
    enemyAttackWindup = 0;

    // RESET HIT REACTIONS
    playerHitStun = 0;
    enemyHitStun = 0;
    playerKnockback = 0;
    enemyKnockback = 0;
    playerHitFlash = 0;
    enemyHitFlash = 0;

    // RESET COMBO
    comboCount = 0;
    comboTimer = 0;

    // RESET VISUAL EFFECTS
    screenShakeTimer = 0;
    hitStopTimer = 0;
    hitSparks = [];

    // RESET INPUTS
    keys.left = false;
    keys.right = false;
    mobileMovement.left = false;
    mobileMovement.right = false;

    // RESET MATCH STATE
    gameOver = false;
    matchWinner = "";

    // START ROUND INTRO AGAIN
    roundState = "ready";
    roundIntroTimer = 0;

    frameCount = 0;

    // UPDATE UI
    updateHealthBars();
    updateComboCounter();

}

/* =================================
   3.3 COMBO DISPLAY
================================= */

function updateComboCounter() {

    const counter = document.getElementById("combo-counter");
    const number = document.getElementById("combo-number");
    const label = document.getElementById("combo-label");

    number.textContent = comboCount;

    label.textContent =
        comboCount === 1 ? "HIT" : "HITS";

    counter.style.opacity =
        comboCount > 0 ? "1" : "0";

}


/* =================================
   4. INPUT SETTINGS
================================= */

const keys = {
    left: false,
    right: false
};

const mobileMovement = {
    left: false,
    right: false
};


/* =================================
   5. KEYBOARD CONTROLS
================================= */

document.addEventListener("keydown", (event) => {

    const key = event.key.toLowerCase();

    if (
        key === "a" ||
        key === "d" ||
        key === "j" ||
        key === "k" ||
        key === " "
    ) {
        event.preventDefault();
    }

    if (key === "a") {
        keys.left = true;
    }

    if (key === "d") {
        keys.right = true;
    }

    if (key === "k" && !event.repeat) {
        jump(player);
    }

    if (key === "j" && !event.repeat) {
        attackPlayer();
    }

});

document.addEventListener("keyup", (event) => {

    const key = event.key.toLowerCase();

    if (key === "a") {
        keys.left = false;
    }

    if (key === "d") {
        keys.right = false;
    }

});

window.addEventListener("blur", () => {

    keys.left = false;
    keys.right = false;

    mobileMovement.left = false;
    mobileMovement.right = false;

});


/* =================================
   6. JUMP FUNCTION
================================= */

function jump(character) {

    if (!character.isGrounded) {
        return;
    }

    character.velocityY = JUMP_POWER;

    character.isJumping = true;
    character.isGrounded = false;

}


/* =================================
   6.1 COMBAT FUNCTIONS
================================= */

// PLAYER ATTACK
function attackPlayer() {

    if (gameOver) {
    return;
}
  
    if (playerAttackCooldown > 0) {
        return;
    }

    if (playerHitStun > 0) {
        return;
    }

    playerAttackCooldown = ATTACK_COOLDOWN;
    playerAttackAnimation = PLAYER_PUNCH_DURATION;

    const distance = enemy.x - player.x;

    const verticalDistance = Math.abs(
        player.y - enemy.y
    );

    const isInHorizontalRange =
        player.facing === 1
            ? distance > 0 && distance <= ATTACK_RANGE
            : distance < 0 && distance >= -ATTACK_RANGE;

    const isInVerticalRange =
        verticalDistance <= 15;

    if (isInHorizontalRange && isInVerticalRange) {

        enemyHealth -= ATTACK_DAMAGE;

        if (enemyHealth < 0) {
            enemyHealth = 0;
        }

        enemyHitFlash = 10;

// PHASE 9B - ENEMY HIT REACTION
enemyHitStun = HIT_STUN_DURATION;
enemyKnockback =
    Math.sign(enemy.x - player.x) * KNOCKBACK_FORCE;

enemyAttackAnimation = 0;
enemyAttackWindup = 0;

screenShakeTimer = SCREEN_SHAKE_DURATION;

      // HIT STOP
hitStopTimer = HIT_STOP_DURATION;

      // PHASE 9C - IMPACT SPARKS

const impactX =
    (player.x + enemy.x) / 2 + SPRITE_WIDTH / 2;

const impactY =
    (player.y + enemy.y) / 2 + 22;

createHitSparks(impactX, impactY);

        comboCount++;
        comboTimer = COMBO_WINDOW;

        updateComboCounter();
        updateHealthBars();
        checkKnockout();
    }

}


// ENEMY ATTACK WITH PREPARATION
function enemyAttackPlayer() {

    if (gameOver) {
    return;
    }
  
    if (playerHealth <= 0) {
        enemyAttackWindup = 0;
        return;
    }

    if (enemyHitStun > 0) {
        enemyAttackWindup = 0;
        return;
    }

    const distance = player.x - enemy.x;

    const isInHorizontalRange =
        Math.abs(distance) <= ENEMY_ATTACK_RANGE;

    const verticalDistance = Math.abs(
        player.y - enemy.y
    );

    const isInVerticalRange =
        verticalDistance <= 15;

    // Cancel preparation if Goku escapes
    if (!isInHorizontalRange || !isInVerticalRange) {
        enemyAttackWindup = 0;
        return;
    }

    // Wait for cooldown
    if (enemyAttackCooldown > 0) {
        return;
    }

    // Begin preparation
    if (enemyAttackWindup === 0) {
        enemyAttackWindup = ENEMY_ATTACK_WINDUP;
        return;
    }

    // Count down preparation
    enemyAttackWindup--;

    // Execute attack when preparation finishes
    if (enemyAttackWindup === 0) {

        // Start punch animation
        enemyAttackAnimation = ENEMY_PUNCH_DURATION;

        // Deal damage
        playerHealth -= ENEMY_ATTACK_DAMAGE;

        if (playerHealth < 0) {
            playerHealth = 0;
        }

        playerHitFlash = 10;

// PHASE 9B - PLAYER HIT REACTION
playerHitStun = HIT_STUN_DURATION;
playerKnockback =
    Math.sign(player.x - enemy.x) * KNOCKBACK_FORCE;

playerAttackAnimation = 0;

screenShakeTimer = SCREEN_SHAKE_DURATION;

      // HIT STOP
hitStopTimer = HIT_STOP_DURATION;

      // PHASE 9C - IMPACT SPARKS

const impactX =
    (player.x + enemy.x) / 2 + SPRITE_WIDTH / 2;

const impactY =
    (player.y + enemy.y) / 2 + 22;

createHitSparks(impactX, impactY);

        enemyAttackCooldown = ENEMY_ATTACK_COOLDOWN;

        updateHealthBars();
        checkKnockout();
    }

}


/* =================================
   7. MOBILE JUMP BUTTON
================================= */

const buttonB = document.getElementById("button-b");

buttonB.addEventListener("pointerdown", (event) => {

    event.preventDefault();

    jump(player);

});


/* =================================
   7.1 MOBILE ATTACK BUTTON
================================= */

const attackButton = document.getElementById("button-a");

attackButton.addEventListener("pointerdown", (event) => {

    event.preventDefault();

    attackPlayer();

});


/* =================================
   8. MOBILE MOVEMENT BUTTONS
================================= */

function setupMovementButton(buttonId, direction) {

    const button = document.getElementById(buttonId);

    button.addEventListener("pointerdown", (event) => {

        event.preventDefault();

        button.setPointerCapture(event.pointerId);

        mobileMovement[direction] = true;

    });

    function stopMovement() {
        mobileMovement[direction] = false;
    }

    button.addEventListener("pointerup", stopMovement);
    button.addEventListener("pointercancel", stopMovement);
    button.addEventListener("lostpointercapture", stopMovement);

}

setupMovementButton("button-left", "left");
setupMovementButton("button-right", "right");


/* =================================
   9. CHARACTER MOVEMENT
================================= */

function movePlayer() {

    if (playerHitStun > 0) {
        player.velocityX = 0;
        return;
    }

    let direction = 0;

    if (keys.left) {
        direction = -1;
    }

    if (keys.right) {
        direction = 1;
    }

    if (mobileMovement.left) {
        direction = -1;
    }

    if (mobileMovement.right) {
        direction = 1;
    }

    player.velocityX = direction * MOVE_SPEED;

    if (direction < 0) {
        player.facing = -1;
    } else if (direction > 0) {
        player.facing = 1;
    }

    player.x += player.velocityX;

    player.x = Math.max(
        0,
        Math.min(WIDTH - SPRITE_WIDTH, player.x)
    );

}


// ENEMY AI MOVEMENT
function moveEnemyAI() {

    const distance = player.x - enemy.x;

    if (enemyHitStun > 0) {
        enemy.velocityX = 0;
        return;
    }
  
    if (distance < 0) {

        enemy.facing = -1;

        if (Math.abs(distance) > ENEMY_STOP_DISTANCE) {
            enemy.velocityX = -ENEMY_MOVE_SPEED;
        } else {
            enemy.velocityX = 0;
        }

    } else if (distance > 0) {

        enemy.facing = 1;

        if (Math.abs(distance) > ENEMY_STOP_DISTANCE) {
            enemy.velocityX = ENEMY_MOVE_SPEED;
        } else {
            enemy.velocityX = 0;
        }

    }

    enemy.x += enemy.velocityX;

    enemy.x = Math.max(
        0,
        Math.min(WIDTH - SPRITE_WIDTH, enemy.x)
    );

}

/* =================================
   PHASE 9B - KNOCKBACK PHYSICS
================================= */

function updateKnockback() {

    // GOKU KNOCKBACK
    if (Math.abs(playerKnockback) > 0.1) {
        player.x += playerKnockback;
        playerKnockback *= KNOCKBACK_FRICTION;
    } else {
        playerKnockback = 0;
    }

    // KRILLIN KNOCKBACK
    if (Math.abs(enemyKnockback) > 0.1) {
        enemy.x += enemyKnockback;
        enemyKnockback *= KNOCKBACK_FRICTION;
    } else {
        enemyKnockback = 0;
    }

    // ARENA BOUNDARIES
    player.x = Math.max(0, Math.min(WIDTH - 32, player.x));
    enemy.x = Math.max(0, Math.min(WIDTH - 32, enemy.x));
}

/* =================================
   PHASE 9C - CREATE HIT SPARKS
================================= */

function createHitSparks(x, y) {

    const angles = [
        0,
        Math.PI / 4,
        Math.PI / 2,
        Math.PI * 3 / 4,
        Math.PI,
        Math.PI * 5 / 4,
        Math.PI * 3 / 2,
        Math.PI * 7 / 4
    ];

    const colors = [
        "#ffffff",
        "#fff7a8",
        "#ffd43b",
        "#ff9633"
    ];

    angles.forEach((angle, i) => {

        const speed = 1.8 + (i % 3) * 0.5;

        hitSparks.push({
            x: x,
            y: y,

            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed,

            life: HIT_SPARK_DURATION,
            maxLife: HIT_SPARK_DURATION,

            size: i % 3 === 0 ? 3 : 2,

            color: colors[i % colors.length]
        });

    });

}


/* =================================
   UPDATE HIT SPARKS
================================= */

function updateHitSparks() {

    for (let i = hitSparks.length - 1; i >= 0; i--) {

        const spark = hitSparks[i];

        spark.x += spark.velocityX;
        spark.y += spark.velocityY;

        spark.velocityX *= 0.96;
        spark.velocityY *= 0.96;

        spark.velocityY += 0.08;

        spark.life--;

        if (spark.life <= 0) {
            hitSparks.splice(i, 1);
        }

    }

}


/* =================================
   DRAW HIT SPARKS
================================= */

function drawHitSparks() {

    ctx.save();

    for (const spark of hitSparks) {

        ctx.globalAlpha =
            spark.life / spark.maxLife;

        ctx.fillStyle = spark.color;

        ctx.fillRect(
            Math.round(spark.x),
            Math.round(spark.y),
            spark.size,
            spark.size
        );

    }

    ctx.restore();

}


/* =================================
   10. GRAVITY AND COLLISIONS
================================= */

function applyPhysics(character) {

    character.velocityY += GRAVITY;

    character.y += character.velocityY;

    const floorPosition = GROUND_Y - SPRITE_HEIGHT;

    if (character.y >= floorPosition) {

        character.y = floorPosition;

        character.velocityY = 0;

        character.isJumping = false;
        character.isGrounded = true;

    }

}


/* =================================
   11. PIXEL DRAWING FUNCTION
================================= */

function pixel(x, y, width, height, color) {

    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);

}


/* =================================
   12. BACKGROUND SKY
================================= */

function drawSky() {

    pixel(0, 0, WIDTH, HEIGHT, "#79c9ed");
    pixel(0, 0, WIDTH, 50, "#65b7e5");
    pixel(0, 50, WIDTH, 50, "#79c9ed");

    pixel(370, 35, 32, 32, "#fff3a3");
    pixel(375, 30, 22, 42, "#fff3a3");
    pixel(378, 40, 16, 22, "#fff9d0");

}


/* =================================
   13. CLOUDS
================================= */

function drawCloud(x, y) {

    const color = "#f3f3f3";

    pixel(x + 10, y, 20, 8, color);
    pixel(x, y + 8, 45, 10, color);
    pixel(x + 8, y + 18, 30, 5, color);

}

function drawClouds() {

    drawCloud(50, 45);
    drawCloud(190, 25);
    drawCloud(310, 70);

}


/* =================================
   14. MOUNTAINS
================================= */

function drawMountain(x, y, width, height, color) {

    ctx.fillStyle = color;

    ctx.beginPath();

    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width / 2, y);
    ctx.lineTo(x + width, y + height);

    ctx.closePath();
    ctx.fill();

}

function drawMountains() {

    drawMountain(0, 105, 160, 85, "#7897a9");
    drawMountain(110, 100, 190, 90, "#6e91a2");
    drawMountain(270, 110, 170, 80, "#7897a9");
    drawMountain(380, 100, 150, 90, "#6e91a2");

    pixel(73, 110, 12, 8, "#d7e6e9");
    pixel(200, 106, 15, 8, "#d7e6e9");
    pixel(430, 108, 12, 8, "#d7e6e9");

}


/* =================================
   15. GROUND
================================= */

function drawGround() {

    pixel(0, 195, WIDTH, 10, "#63b54a");
    pixel(0, 205, WIDTH, 65, "#79513b");

    pixel(20, 195, 8, 3, "#91d65d");
    pixel(90, 198, 12, 3, "#91d65d");
    pixel(170, 195, 10, 3, "#91d65d");
    pixel(290, 197, 14, 3, "#91d65d");
    pixel(410, 195, 10, 3, "#91d65d");

    pixel(35, 220, 12, 4, "#99684b");
    pixel(120, 240, 16, 4, "#593b30");
    pixel(230, 215, 10, 4, "#593b30");
    pixel(340, 245, 18, 4, "#99684b");
    pixel(430, 225, 12, 4, "#593b30");

    pixel(65, 200, 7, 5, "#777777");
    pixel(270, 200, 8, 5, "#777777");
    pixel(390, 201, 7, 4, "#777777");

}


/* =================================
   16. ARENA DECORATIONS
================================= */

function drawDecorations() {

    pixel(15, 185, 20, 10, "#347e36");
    pixel(22, 180, 12, 8, "#4d9e42");

    pixel(440, 185, 22, 10, "#347e36");
    pixel(445, 180, 13, 8, "#4d9e42");

    pixel(105, 188, 3, 7, "#398e36");
    pixel(155, 190, 3, 5, "#398e36");
    pixel(315, 187, 3, 8, "#398e36");
    pixel(365, 190, 3, 5, "#398e36");

}


/* =================================
   17. CHARACTER SHADOW
================================= */

function drawShadow(x, y) {

    pixel(x + 4, y, 24, 3, "#493c35");
    pixel(x + 8, y - 2, 16, 2, "#493c35");

}

/* =================================
   18. GOKU SPRITE - RECTANGLES (matches reference image)
   Every p(x, y, width, height, color) draws one rectangle.
   The sprite is a 32 x 48 pixel grid (same size as the fighter
   hitbox). Goku's body is drawn the same in every pose; only
   his front (right-hand) arm changes between idle and punch.
================================= */

const GOKU_HEIGHT = 48;   // sprite height in pixels
const GOKU_ANCHOR_X = 16; // column that lines up with the middle of his body

function drawGoku(x, y, facing, pose = "idle") {

    ctx.save();

    // Feet land exactly on the ground line
    ctx.translate(
        Math.round(x + SPRITE_WIDTH / 2),
        Math.round(y + SPRITE_HEIGHT - GOKU_HEIGHT)
    );

    ctx.scale(facing, 1);

    ctx.translate(-GOKU_ANCHOR_X, 0);

    const p = (x, y, w, h, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    };

    // --- COLOR PALETTE ---
    const BLK = "#000000"; // Black outline / hair
    const NVY = "#0d0e25"; // Navy outline
    const BLU = "#21315f"; // Blue undershirt
    const BLL = "#2e48ac"; // Blue light (wristband)
    const ORX = "#480906"; // Gi darkest shadow
    const ORR = "#76150a"; // Gi red-brown shadow
    const ORD = "#ab2a12"; // Gi dark orange
    const ORG = "#f45a1e"; // Gi orange
    const SKD = "#894a3c"; // Skin shadow
    const SKS = "#bc6a4d"; // Skin mid-shadow
    const SKM = "#e39776"; // Skin mid
    const SKL = "#fbd6bf"; // Skin light
    const WHT = "#f6f6f3"; // White highlight
    const GRY = "#aab2b1"; // Gray highlight
    const RED = "#e01e27"; // Boot red
    const YEL = "#e4b52a"; // Boot yellow

    // --- BODY (same in every pose) ---
    // Black outline / hair
    p(19, 0, 2, 1, BLK);
    p(17, 1, 3, 2, BLK);
    p(16, 2, 1, 15, BLK);
    p(15, 3, 1, 13, BLK);
    p(17, 3, 2, 2, BLK);
    p(14, 4, 1, 16, BLK);
    p(22, 4, 4, 5, BLK);
    p(17, 5, 1, 13, BLK);
    p(20, 5, 2, 11, BLK);
    p(26, 5, 2, 3, BLK);
    p(13, 6, 1, 14, BLK);
    p(19, 6, 1, 14, BLK);
    p(28, 6, 1, 2, BLK);
    p(11, 7, 1, 12, BLK);
    p(18, 7, 1, 12, BLK);
    p(29, 7, 1, 1, BLK);
    p(26, 8, 1, 1, BLK);
    p(12, 9, 1, 10, BLK);
    p(22, 9, 3, 1, BLK);
    p(3, 10, 2, 1, BLK);
    p(10, 10, 1, 8, BLK);
    p(22, 10, 2, 7, BLK);
    p(4, 11, 4, 1, BLK);
    p(24, 11, 3, 4, BLK);
    p(5, 12, 5, 1, BLK);
    p(27, 12, 2, 3, BLK);
    p(6, 13, 4, 5, BLK);
    p(29, 13, 1, 2, BLK);
    p(1, 14, 5, 1, BLK);
    p(30, 14, 1, 1, BLK);
    p(3, 15, 3, 1, BLK);
    p(24, 15, 2, 2, BLK);
    p(5, 16, 1, 2, BLK);
    p(21, 16, 1, 1, BLK);
    p(26, 16, 1, 1, BLK);
    p(3, 17, 2, 1, BLK);
    p(23, 17, 2, 1, BLK);
    p(6, 18, 3, 1, BLK);
    p(15, 18, 1, 1, BLK);
    p(8, 19, 1, 2, BLK);
    p(16, 19, 2, 1, BLK);
    p(6, 20, 2, 1, BLK);
    p(18, 20, 1, 1, BLK);

    // Navy outline
    p(24, 21, 1, 1, NVY);
    p(6, 27, 2, 1, NVY);
    p(7, 29, 1, 1, NVY);
    p(11, 29, 1, 2, NVY);
    p(5, 30, 2, 1, NVY);
    p(19, 30, 1, 1, NVY);
    p(4, 41, 1, 3, NVY);
    p(7, 41, 1, 2, NVY);
    p(27, 41, 1, 3, NVY);
    p(24, 42, 1, 2, NVY);
    p(3, 43, 1, 1, NVY);
    p(6, 43, 1, 3, NVY);
    p(2, 44, 1, 1, NVY);
    p(25, 44, 1, 3, NVY);
    p(28, 44, 1, 2, NVY);
    p(1, 45, 1, 2, NVY);
    p(2, 46, 4, 1, NVY);
    p(29, 46, 1, 1, NVY);
    p(26, 47, 3, 1, NVY);

    // Blue undershirt
    p(17, 20, 1, 2, BLU);
    p(11, 22, 1, 5, BLU);
    p(22, 22, 3, 2, BLU);
    p(21, 24, 3, 2, BLU);
    p(12, 25, 1, 3, BLU);
    p(17, 25, 1, 1, BLU);
    p(13, 26, 4, 1, BLU);
    p(13, 27, 3, 1, BLU);
    p(6, 28, 2, 1, BLU);
    p(13, 28, 2, 1, BLU);
    p(5, 29, 2, 1, BLU);
    p(12, 30, 2, 1, BLU);
    p(18, 30, 1, 1, BLU);
    p(14, 31, 4, 1, BLU);
    p(6, 41, 1, 2, BLU);
    p(26, 41, 1, 2, BLU);
    p(5, 44, 1, 2, BLU);
    p(27, 44, 1, 1, BLU);
    p(3, 45, 2, 1, BLU);
    p(26, 45, 1, 2, BLU);
    p(28, 46, 1, 1, BLU);

    // Blue light (wristband)
    p(12, 29, 1, 1, BLL);
    p(14, 30, 4, 1, BLL);
    p(13, 31, 1, 1, BLL);

    // Gi darkest shadow
    p(9, 21, 1, 1, ORX);
    p(8, 22, 1, 3, ORX);
    p(9, 25, 1, 3, ORX);
    p(21, 27, 1, 2, ORX);
    p(10, 28, 1, 1, ORX);
    p(19, 29, 2, 1, ORX);
    p(9, 31, 3, 1, ORX);
    p(20, 31, 1, 1, ORX);
    p(6, 32, 3, 1, ORX);
    p(21, 32, 2, 1, ORX);
    p(4, 33, 2, 1, ORX);
    p(23, 33, 1, 1, ORX);
    p(3, 34, 1, 2, ORX);
    p(24, 34, 2, 1, ORX);
    p(26, 35, 1, 2, ORX);
    p(2, 36, 1, 1, ORX);
    p(1, 37, 1, 2, ORX);
    p(9, 37, 9, 1, ORX);
    p(27, 37, 1, 1, ORX);
    p(8, 38, 1, 2, ORX);
    p(18, 38, 2, 1, ORX);
    p(28, 38, 1, 3, ORX);
    p(2, 39, 1, 1, ORX);
    p(20, 39, 2, 1, ORX);
    p(3, 40, 1, 1, ORX);
    p(7, 40, 1, 1, ORX);
    p(21, 40, 1, 2, ORX);
    p(22, 42, 2, 1, ORX);

    // Gi red-brown shadow
    p(15, 32, 1, 5, ORR);
    p(20, 32, 1, 1, ORR);
    p(6, 33, 1, 1, ORR);
    p(14, 33, 1, 3, ORR);
    p(6, 37, 3, 1, ORR);
    p(26, 37, 1, 2, ORR);
    p(5, 38, 1, 1, ORR);
    p(20, 38, 3, 1, ORR);
    p(23, 39, 1, 1, ORR);
    p(5, 41, 1, 2, ORR);
    p(3, 44, 2, 1, ORR);
    p(2, 45, 1, 1, ORR);

    // Gi dark orange
    p(22, 21, 2, 1, ORD);
    p(10, 22, 1, 2, ORD);
    p(21, 22, 1, 1, ORD);
    p(9, 24, 1, 1, ORD);
    p(20, 26, 2, 1, ORD);
    p(10, 27, 1, 1, ORD);
    p(19, 27, 1, 1, ORD);
    p(11, 28, 1, 1, ORD);
    p(16, 28, 1, 2, ORD);
    p(17, 29, 1, 1, ORD);
    p(12, 31, 1, 2, ORD);
    p(18, 31, 1, 4, ORD);
    p(9, 32, 3, 1, ORD);
    p(14, 32, 1, 1, ORD);
    p(17, 32, 1, 2, ORD);
    p(7, 33, 1, 1, ORD);
    p(22, 33, 1, 1, ORD);
    p(12, 34, 2, 2, ORD);
    p(10, 35, 2, 1, ORD);
    p(19, 35, 1, 1, ORD);
    p(3, 36, 1, 3, ORD);
    p(9, 36, 1, 1, ORD);
    p(14, 36, 1, 1, ORD);
    p(4, 37, 2, 1, ORD);
    p(18, 37, 1, 1, ORD);
    p(4, 38, 1, 1, ORD);
    p(6, 38, 1, 1, ORD);
    p(23, 38, 3, 1, ORD);
    p(22, 39, 1, 1, ORD);
    p(24, 39, 3, 1, ORD);
    p(6, 40, 1, 1, ORD);
    p(25, 40, 2, 1, ORD);
    p(22, 41, 1, 1, ORD);

    // Gi orange
    p(9, 22, 1, 2, ORG);
    p(20, 23, 2, 1, ORG);
    p(10, 24, 1, 3, ORG);
    p(19, 24, 2, 2, ORG);
    p(18, 25, 1, 2, ORG);
    p(17, 26, 1, 1, ORG);
    p(19, 26, 1, 1, ORG);
    p(11, 27, 1, 1, ORG);
    p(16, 27, 1, 1, ORG);
    p(20, 27, 1, 2, ORG);
    p(12, 28, 1, 1, ORG);
    p(15, 28, 1, 2, ORG);
    p(19, 28, 1, 1, ORG);
    p(13, 29, 2, 1, ORG);
    p(18, 29, 1, 1, ORG);
    p(19, 31, 1, 4, ORG);
    p(13, 32, 1, 2, ORG);
    p(16, 32, 1, 5, ORG);
    p(8, 33, 5, 1, ORG);
    p(20, 33, 2, 5, ORG);
    p(4, 34, 8, 1, ORG);
    p(17, 34, 1, 3, ORG);
    p(22, 34, 2, 4, ORG);
    p(4, 35, 6, 1, ORG);
    p(18, 35, 1, 2, ORG);
    p(24, 35, 2, 3, ORG);
    p(4, 36, 5, 1, ORG);
    p(10, 36, 4, 1, ORG);
    p(19, 36, 1, 2, ORG);
    p(2, 37, 1, 2, ORG);
    p(7, 38, 1, 2, ORG);
    p(27, 38, 1, 3, ORG);
    p(3, 39, 4, 1, ORG);
    p(4, 40, 2, 1, ORG);
    p(22, 40, 3, 1, ORG);
    p(23, 41, 2, 1, ORG);

    // Skin shadow
    p(22, 17, 1, 1, SKD);
    p(9, 18, 1, 3, SKD);
    p(21, 19, 1, 3, SKD);
    p(10, 21, 2, 1, SKD);
    p(20, 22, 1, 1, SKD);
    p(19, 23, 1, 1, SKD);
    p(4, 24, 2, 1, SKD);
    p(17, 24, 2, 1, SKD);
    p(0, 25, 3, 1, SKD);
    p(4, 25, 1, 2, SKD);
    p(6, 25, 1, 2, SKD);
    p(0, 26, 1, 1, SKD);
    p(3, 26, 1, 1, SKD);
    p(8, 26, 1, 1, SKD);
    p(1, 27, 1, 1, SKD);
    p(0, 28, 1, 2, SKD);
    p(8, 29, 3, 1, SKD);
    p(1, 30, 1, 1, SKD);
    p(4, 30, 1, 1, SKD);
    p(2, 31, 2, 1, SKD);

    // Skin mid-shadow
    p(12, 19, 1, 3, SKS);
    p(14, 20, 1, 1, SKS);
    p(13, 22, 1, 3, SKS);
    p(14, 23, 1, 1, SKS);
    p(15, 24, 2, 1, SKS);
    p(2, 27, 4, 1, SKS);
    p(3, 28, 3, 1, SKS);
    p(1, 29, 2, 1, SKS);
    p(4, 29, 1, 1, SKS);

    // Skin mid
    p(15, 16, 1, 2, SKM);
    p(16, 17, 1, 2, SKM);
    p(10, 18, 1, 3, SKM);
    p(17, 18, 1, 1, SKM);
    p(21, 18, 1, 1, SKM);
    p(11, 19, 1, 2, SKM);
    p(18, 19, 1, 1, SKM);
    p(13, 20, 1, 2, SKM);
    p(14, 21, 1, 2, SKM);
    p(20, 21, 1, 1, SKM);
    p(12, 22, 1, 3, SKM);
    p(15, 22, 1, 1, SKM);
    p(18, 23, 1, 1, SKM);
    p(14, 24, 1, 2, SKM);
    p(5, 25, 1, 2, SKM);
    p(13, 25, 1, 1, SKM);
    p(15, 25, 2, 1, SKM);
    p(1, 26, 2, 1, SKM);
    p(8, 27, 1, 2, SKM);
    p(1, 28, 2, 1, SKM);
    p(9, 28, 1, 1, SKM);
    p(3, 29, 1, 2, SKM);
    p(2, 30, 1, 1, SKM);

    // Skin light
    p(20, 16, 1, 5, SKL);
    p(21, 17, 1, 1, SKL);
    p(19, 20, 1, 3, SKL);
    p(18, 21, 1, 2, SKL);
    p(16, 22, 2, 2, SKL);
    p(15, 23, 1, 1, SKL);

    // White highlight
    p(15, 20, 2, 2, WHT);
    p(17, 27, 1, 1, WHT);
    p(18, 28, 1, 1, WHT);

    // Gray highlight
    p(15, 19, 1, 1, GRY);
    p(18, 27, 1, 1, GRY);
    p(17, 28, 1, 1, GRY);

    // Boot red
    p(25, 41, 1, 2, RED);
    p(26, 44, 1, 1, RED);
    p(27, 45, 1, 2, RED);

    // Boot yellow
    p(5, 43, 1, 1, YEL);
    p(25, 43, 2, 1, YEL);

    // --- FRONT ARM (changes with the pose) ---
    if (pose === "punch") {

        // Extended arm: sleeve, forearm, wristband, fist
        p(23, 20, 16, 1, NVY);
        p(23, 25, 16, 1, NVY);
        p(38, 21, 1, 4, NVY);
        p(23, 24, 5, 1, NVY);
        p(23, 21, 5, 1, BLL);
        p(31, 21, 2, 3, BLL);
        p(23, 22, 5, 2, BLU);
        p(31, 24, 2, 1, BLU);
        p(28, 21, 3, 2, SKL);
        p(33, 21, 5, 2, SKL);
        p(28, 23, 3, 1, SKM);
        p(33, 23, 5, 1, SKM);
        p(28, 24, 3, 1, SKS);
        p(33, 24, 5, 1, SKS);
        p(35, 22, 1, 2, SKD);
        p(37, 22, 1, 3, SKD);

    } else {

        // Black outline / hair
        p(25, 17, 2, 1, BLK);
        p(25, 18, 1, 1, BLK);

        // Navy outline
        p(25, 22, 1, 2, NVY);
        p(26, 23, 1, 1, NVY);
        p(27, 24, 1, 2, NVY);
        p(30, 24, 1, 2, NVY);

        // Blue undershirt
        p(27, 23, 1, 1, BLU);
        p(24, 24, 1, 1, BLU);

        // Blue light (wristband)
        p(28, 24, 2, 2, BLL);

        // Gi darkest shadow
        p(22, 20, 2, 1, ORX);

        // Skin shadow
        p(27, 17, 3, 1, SKD);
        p(22, 18, 1, 1, SKD);
        p(26, 18, 1, 2, SKD);
        p(30, 18, 1, 3, SKD);
        p(25, 20, 1, 2, SKD);
        p(31, 21, 1, 3, SKD);
        p(26, 22, 1, 1, SKD);
        p(30, 26, 1, 2, SKD);
        p(24, 27, 2, 1, SKD);
        p(26, 28, 1, 1, SKD);
        p(29, 28, 1, 2, SKD);
        p(27, 29, 2, 1, SKD);

        // Skin mid-shadow
        p(26, 20, 2, 1, SKS);
        p(27, 21, 1, 2, SKS);
        p(24, 25, 1, 2, SKS);

        // Skin mid
        p(27, 18, 1, 1, SKM);
        p(28, 19, 2, 1, SKM);
        p(29, 20, 1, 1, SKM);
        p(29, 22, 2, 2, SKM);
        p(25, 25, 1, 1, SKM);
        p(26, 26, 2, 1, SKM);
        p(26, 27, 1, 1, SKM);
        p(29, 27, 1, 1, SKM);

        // Skin light
        p(28, 18, 2, 1, SKL);
        p(27, 19, 1, 1, SKL);
        p(28, 20, 1, 4, SKL);
        p(26, 21, 1, 1, SKL);
        p(29, 21, 2, 1, SKL);
        p(25, 24, 2, 1, SKL);
        p(26, 25, 1, 1, SKL);
        p(25, 26, 1, 1, SKL);
        p(28, 26, 2, 1, SKL);
        p(27, 27, 2, 2, SKL);

        // White highlight
        p(23, 18, 2, 2, WHT);
        p(22, 19, 1, 1, WHT);
        p(25, 19, 1, 1, WHT);
        p(24, 20, 1, 1, WHT);

    }

    ctx.restore();

}

/* =================================
   19. KRILLIN SPRITE - RECTANGLES (matches reference image)
   Every p(x, y, width, height, color) draws one rectangle.
   Krillin's body is drawn the same in every pose; only the
   front arm changes between the standing and punch poses.
================================= */

const KRILLIN_SCALE = 1;    // 1 = same pixel size as Goku, 2 = bigger Krillin
const KRILLIN_HEIGHT = 36;  // sprite height in pixels
const KRILLIN_ANCHOR_X = 13; // column that lines up with the middle of his body

function drawKrillin(x, y, facing, pose = "idle") {

    ctx.save();

    if (enemyHitFlash > 0) {
        ctx.globalAlpha = 0.5;
    }

    // Feet land exactly on the ground line
    ctx.translate(
        Math.round(x + SPRITE_WIDTH / 2),
        Math.round(y + SPRITE_HEIGHT - KRILLIN_HEIGHT * KRILLIN_SCALE)
    );

    ctx.scale(facing * KRILLIN_SCALE, KRILLIN_SCALE);

    ctx.translate(-KRILLIN_ANCHOR_X, 0);

    const p = (x, y, w, h, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    };

    // --- COLOR PALETTE ---
    const BLK = "#000000"; // Black outline
    const SKL = "#f8d4ae"; // Skin light
    const SKM = "#d27c58"; // Skin mid (shading, forehead dots)
    const SKD = "#903c3c"; // Skin shadow
    const ORG = "#f86c0c"; // Gi orange
    const RED = "#b4241c"; // Gi red
    const BLU = "#4455dd"; // Blue (belt / pants / wristbands)
    const BLM = "#3048b4"; // Blue mid
    const NVY = "#1c2a78"; // Navy
    const SLT = "#3c546c"; // Boot slate
    const DRK = "#182430"; // Boot dark
    const YEL = "#d8c054"; // Boot yellow
    const WHT = "#f2f2f2"; // White highlight
    const GRY = "#849cb4"; // Gray-blue highlight

    // --- BODY (same in every pose) ---
    // Black outline
    p(11, 0, 5, 1, BLK);
    p(9, 1, 2, 1, BLK);
    p(16, 1, 2, 1, BLK);
    p(8, 2, 1, 2, BLK);
    p(18, 2, 1, 1, BLK);
    p(19, 3, 1, 2, BLK);
    p(7, 4, 1, 8, BLK);
    p(20, 5, 1, 6, BLK);
    p(8, 8, 1, 1, BLK);
    p(12, 8, 2, 1, BLK);
    p(9, 9, 1, 1, BLK);
    p(14, 9, 1, 1, BLK);
    p(19, 9, 1, 1, BLK);
    p(15, 10, 2, 1, BLK);
    p(18, 10, 1, 1, BLK);
    p(19, 11, 1, 3, BLK);
    p(8, 12, 2, 1, BLK);
    p(6, 13, 3, 1, BLK);
    p(10, 13, 1, 1, BLK);
    p(18, 13, 1, 1, BLK);
    p(20, 13, 1, 1, BLK);
    p(22, 13, 1, 1, BLK);
    p(26, 13, 1, 1, BLK);
    p(6, 14, 1, 1, BLK);
    p(17, 14, 1, 1, BLK);
    p(5, 15, 1, 2, BLK);
    p(15, 15, 2, 1, BLK);
    p(2, 16, 2, 1, BLK);
    p(0, 17, 2, 1, BLK);
    p(4, 17, 1, 3, BLK);
    p(6, 17, 1, 2, BLK);
    p(22, 17, 1, 1, BLK);
    p(25, 17, 1, 1, BLK);
    p(0, 18, 1, 2, BLK);
    p(7, 18, 1, 1, BLK);
    p(19, 18, 1, 1, BLK);
    p(5, 19, 1, 1, BLK);
    p(8, 19, 1, 4, BLK);
    p(18, 19, 1, 2, BLK);
    p(1, 20, 1, 1, BLK);
    p(2, 21, 6, 1, BLK);
    p(9, 21, 1, 2, BLK);
    p(17, 21, 1, 1, BLK);
    p(16, 22, 1, 1, BLK);
    p(5, 23, 3, 1, BLK);
    p(17, 23, 1, 1, BLK);
    p(4, 24, 1, 1, BLK);
    p(18, 24, 2, 1, BLK);
    p(3, 25, 1, 2, BLK);
    p(20, 25, 2, 1, BLK);
    p(22, 26, 1, 1, BLK);
    p(2, 27, 1, 2, BLK);
    p(23, 27, 1, 4, BLK);
    p(9, 28, 6, 1, BLK);
    p(3, 29, 1, 1, BLK);
    p(9, 29, 1, 1, BLK);
    p(15, 29, 1, 1, BLK);
    p(4, 30, 1, 3, BLK);
    p(7, 30, 2, 1, BLK);
    p(16, 30, 1, 1, BLK);
    p(7, 31, 1, 2, BLK);
    p(17, 31, 3, 1, BLK);
    p(24, 31, 1, 3, BLK);
    p(20, 32, 1, 1, BLK);
    p(3, 33, 1, 1, BLK);
    p(6, 33, 1, 2, BLK);
    p(21, 33, 1, 1, BLK);
    p(2, 34, 1, 1, BLK);
    p(22, 34, 1, 2, BLK);
    p(25, 34, 1, 2, BLK);

    // Skin light
    p(12, 1, 4, 2, SKL);
    p(10, 2, 2, 2, SKL);
    p(16, 2, 2, 1, SKL);
    p(9, 3, 1, 1, SKL);
    p(12, 3, 3, 5, SKL);
    p(16, 3, 1, 2, SKL);
    p(18, 3, 1, 2, SKL);
    p(11, 4, 1, 1, SKL);
    p(15, 4, 1, 6, SKL);
    p(17, 4, 1, 10, SKL);
    p(19, 5, 1, 4, SKL);
    p(16, 6, 1, 1, SKL);
    p(18, 6, 1, 1, SKL);
    p(14, 8, 1, 1, SKL);
    p(16, 8, 1, 2, SKL);
    p(18, 8, 1, 2, SKL);
    p(8, 9, 1, 3, SKL);
    p(13, 9, 1, 6, SKL);
    p(14, 10, 1, 5, SKL);
    p(9, 11, 1, 1, SKL);
    p(12, 11, 1, 3, SKL);
    p(16, 11, 1, 2, SKL);
    p(15, 12, 1, 1, SKL);
    p(18, 12, 1, 1, SKL);
    p(15, 14, 2, 1, SKL);
    p(24, 14, 1, 1, SKL);
    p(10, 16, 2, 1, SKL);
    p(13, 16, 2, 1, SKL);
    p(3, 17, 1, 1, SKL);
    p(1, 18, 1, 1, SKL);
    p(2, 19, 2, 1, SKL);
    p(2, 20, 1, 1, SKL);

    // Skin mid (shading, forehead dots)
    p(11, 1, 1, 1, SKM);
    p(9, 2, 1, 1, SKM);
    p(15, 3, 1, 1, SKM);
    p(17, 3, 1, 1, SKM);
    p(8, 4, 3, 4, SKM);
    p(11, 5, 1, 9, SKM);
    p(16, 5, 1, 1, SKM);
    p(18, 5, 1, 1, SKM);
    p(16, 7, 1, 1, SKM);
    p(18, 7, 1, 1, SKM);
    p(9, 8, 2, 1, SKM);
    p(10, 9, 1, 4, SKM);
    p(12, 9, 1, 2, SKM);
    p(9, 10, 1, 1, SKM);
    p(19, 10, 1, 1, SKM);
    p(15, 13, 2, 1, SKM);
    p(10, 14, 1, 2, SKM);
    p(12, 14, 1, 1, SKM);
    p(12, 16, 1, 1, SKM);
    p(2, 17, 1, 2, SKM);
    p(3, 18, 1, 1, SKM);
    p(1, 19, 1, 1, SKM);
    p(6, 19, 2, 2, SKM);
    p(3, 20, 1, 1, SKM);

    // Skin shadow
    p(11, 14, 1, 2, SKD);
    p(12, 15, 3, 1, SKD);

    // Gi orange
    p(7, 14, 2, 2, ORG);
    p(18, 14, 1, 1, ORG);
    p(17, 15, 1, 2, ORG);
    p(8, 16, 1, 1, ORG);
    p(15, 16, 2, 1, ORG);
    p(15, 17, 1, 2, ORG);
    p(9, 18, 1, 2, ORG);
    p(14, 18, 1, 2, ORG);
    p(10, 19, 1, 2, ORG);
    p(13, 19, 1, 3, ORG);
    p(11, 20, 2, 1, ORG);
    p(12, 21, 1, 1, ORG);
    p(8, 23, 3, 1, ORG);
    p(14, 23, 3, 1, ORG);
    p(5, 24, 5, 1, ORG);
    p(15, 24, 3, 1, ORG);
    p(4, 25, 5, 1, ORG);
    p(11, 25, 1, 1, ORG);
    p(16, 25, 3, 3, ORG);
    p(4, 26, 3, 1, ORG);
    p(15, 26, 1, 1, ORG);
    p(19, 26, 1, 3, ORG);
    p(21, 26, 1, 4, ORG);
    p(4, 27, 2, 1, ORG);
    p(22, 27, 1, 2, ORG);
    p(3, 28, 1, 1, ORG);
    p(6, 28, 1, 1, ORG);
    p(18, 28, 1, 1, ORG);
    p(4, 29, 2, 1, ORG);
    p(19, 30, 2, 1, ORG);

    // Gi red
    p(9, 13, 1, 3, RED);
    p(8, 17, 1, 2, RED);
    p(16, 17, 2, 2, RED);
    p(18, 18, 1, 1, RED);
    p(17, 19, 1, 2, RED);
    p(9, 20, 1, 1, RED);
    p(14, 20, 1, 2, RED);
    p(11, 21, 1, 1, RED);
    p(15, 21, 2, 1, RED);
    p(12, 24, 1, 4, RED);
    p(14, 24, 1, 1, RED);
    p(15, 25, 1, 1, RED);
    p(19, 25, 1, 1, RED);
    p(7, 26, 2, 4, RED);
    p(11, 26, 1, 2, RED);
    p(20, 26, 1, 4, RED);
    p(3, 27, 1, 1, RED);
    p(6, 27, 1, 1, RED);
    p(15, 27, 1, 2, RED);
    p(4, 28, 2, 1, RED);
    p(16, 28, 2, 2, RED);
    p(6, 29, 1, 1, RED);
    p(18, 29, 2, 1, RED);
    p(22, 29, 1, 1, RED);
    p(17, 30, 2, 1, RED);
    p(21, 30, 1, 1, RED);

    // Blue (belt / pants / wristbands)
    p(12, 22, 2, 1, BLU);
    p(15, 22, 1, 1, BLU);
    p(11, 23, 1, 2, BLU);
    p(10, 24, 1, 4, BLU);
    p(13, 24, 1, 4, BLU);
    p(9, 25, 1, 3, BLU);
    p(14, 25, 1, 3, BLU);

    // Blue mid
    p(19, 14, 2, 1, BLM);
    p(18, 15, 1, 1, BLM);
    p(20, 15, 1, 1, BLM);
    p(9, 16, 1, 1, BLM);
    p(19, 16, 1, 1, BLM);
    p(10, 17, 5, 1, BLM);
    p(12, 19, 1, 1, BLM);

    // Navy
    p(19, 15, 1, 1, NVY);
    p(6, 16, 1, 1, NVY);
    p(18, 16, 1, 2, NVY);
    p(7, 17, 1, 1, NVY);
    p(9, 17, 1, 1, NVY);
    p(11, 18, 1, 2, NVY);
    p(13, 18, 1, 1, NVY);
    p(4, 20, 2, 1, NVY);
    p(10, 21, 1, 2, NVY);
    p(11, 22, 1, 1, NVY);
    p(14, 22, 1, 1, NVY);
    p(12, 23, 2, 1, NVY);

    // Boot slate
    p(15, 11, 1, 1, SLT);
    p(18, 11, 1, 1, SLT);
    p(22, 30, 1, 3, SLT);
    p(20, 31, 2, 1, SLT);
    p(21, 32, 1, 1, SLT);
    p(23, 32, 1, 1, SLT);
    p(23, 34, 2, 2, SLT);

    // Boot dark
    p(6, 15, 1, 1, DRK);
    p(7, 16, 1, 1, DRK);
    p(10, 18, 1, 1, DRK);
    p(12, 18, 1, 1, DRK);
    p(5, 30, 2, 2, DRK);
    p(23, 31, 1, 1, DRK);
    p(4, 33, 2, 2, DRK);
    p(3, 34, 1, 1, DRK);

    // Boot yellow
    p(5, 32, 2, 1, YEL);
    p(22, 33, 2, 1, YEL);

    // White highlight
    p(5, 17, 1, 2, WHT);
    p(15, 19, 1, 1, WHT);
    p(16, 20, 1, 1, WHT);

    // Gray-blue highlight
    p(16, 19, 1, 1, GRY);
    p(15, 20, 1, 1, GRY);

    // --- FRONT ARM (changes with the pose; "windup" uses the standing arm) ---
    if (pose === "punch") {

        // Black outline
        p(29, 12, 4, 1, BLK);
        p(21, 13, 1, 1, BLK);
        p(23, 13, 3, 1, BLK);
        p(27, 13, 2, 1, BLK);
        p(33, 13, 1, 5, BLK);
        p(19, 17, 3, 1, BLK);
        p(23, 17, 2, 1, BLK);
        p(26, 17, 3, 1, BLK);
        p(29, 18, 4, 1, BLK);

        // Skin light
        p(29, 13, 4, 2, SKL);
        p(23, 14, 1, 2, SKL);
        p(25, 14, 2, 2, SKL);
        p(24, 15, 1, 1, SKL);
        p(29, 15, 2, 1, SKL);
        p(32, 15, 1, 1, SKL);

        // Skin mid (shading, forehead dots)
        p(31, 15, 1, 3, SKM);
        p(23, 16, 4, 1, SKM);
        p(29, 16, 2, 2, SKM);
        p(32, 16, 1, 2, SKM);

        // Blue (belt / pants / wristbands)
        p(27, 14, 2, 3, BLU);

        // Blue mid
        p(21, 14, 2, 1, BLM);
        p(20, 16, 1, 1, BLM);

        // Navy
        p(21, 15, 2, 2, NVY);

    } else {

        // Black outline
        p(23, 10, 3, 1, BLK);
        p(22, 11, 1, 2, BLK);
        p(26, 11, 1, 2, BLK);
        p(21, 14, 3, 1, BLK);
        p(26, 14, 1, 3, BLK);
        p(21, 15, 1, 1, BLK);
        p(23, 15, 1, 2, BLK);
        p(22, 16, 1, 1, BLK);
        p(25, 18, 1, 1, BLK);
        p(20, 19, 2, 1, BLK);
        p(24, 19, 1, 1, BLK);
        p(22, 20, 2, 1, BLK);

        // Skin light
        p(24, 11, 2, 1, SKL);
        p(23, 12, 1, 1, SKL);
        p(24, 13, 2, 1, SKL);
        p(20, 16, 2, 2, SKL);
        p(23, 17, 2, 2, SKL);
        p(23, 19, 1, 1, SKL);

        // Skin mid (shading, forehead dots)
        p(23, 11, 1, 1, SKM);
        p(24, 12, 2, 1, SKM);
        p(23, 13, 1, 1, SKM);
        p(25, 14, 1, 1, SKM);
        p(19, 17, 1, 1, SKM);
        p(20, 18, 3, 1, SKM);
        p(22, 19, 1, 1, SKM);

        // Blue (belt / pants / wristbands)
        p(24, 15, 2, 2, BLU);

        // White highlight
        p(22, 15, 1, 1, WHT);

    }

    ctx.restore();

}


/* =================================
   20. DRAW FIGHTERS
================================= */


function drawFighters() {

    // IDLE ANIMATION
    const playerIdle = player.isGrounded
        ? Math.floor(Math.sin(frameCount * 0.08))
        : 0;

    const enemyIdle = enemy.isGrounded
        ? Math.floor(Math.sin(frameCount * 0.08))
        : 0;

    // SHADOWS
    drawShadow(player.x, GROUND_Y);
    drawShadow(enemy.x, GROUND_Y);


    // =================================
    // GOKU ATTACK ANIMATION
    // =================================

    let playerPose = "idle";
    let playerLunge = 0;

    if (playerAttackAnimation > 0) {

        const progress =
            PLAYER_PUNCH_DURATION - playerAttackAnimation;

        // Anticipation: pull back slightly
        if (progress <= 2) {
            playerLunge = -player.facing * 2;
        }

        // Punch extension
        else if (progress >= 3 && progress <= 7) {
            playerPose = "punch";
            playerLunge = player.facing * 5;
        }

        // Recovery
        else {
            playerLunge = player.facing * 2;
        }

    }

  // GOKU HURT REACTION
let playerHurtTilt = 0;

if (playerHitStun > 0) {
    const progress =
        1 - playerHitStun / HIT_STUN_DURATION;

    playerHurtTilt =
        Math.sin(progress * Math.PI) * 0.22 * player.facing;
}

    ctx.save();

ctx.translate(
    player.x + SPRITE_WIDTH / 2,
    player.y + SPRITE_HEIGHT
);

ctx.rotate(playerHurtTilt);

ctx.translate(
    -(player.x + SPRITE_WIDTH / 2),
    -(player.y + SPRITE_HEIGHT)
);

ctx.globalAlpha = playerHitFlash > 0 ? 0.4 : 1;

    drawGoku(
        player.x + playerLunge,
        player.y + playerIdle,
        player.facing,
        playerPose
    );

    ctx.restore();


    // =================================
    // KRILLIN ATTACK ANIMATION
    // =================================

    let enemyPose = "idle";
    let enemyLunge = 0;

    if (enemyAttackWindup > 0) {

        enemyPose = "idle";

    } else if (enemyAttackAnimation > 0) {

        const progress =
            ENEMY_PUNCH_DURATION - enemyAttackAnimation;

        // Anticipation
        if (progress <= 2) {
            enemyLunge = -enemy.facing * 2;
        }

        // Punch extension
        else if (progress >= 3 && progress <= 7) {
            enemyPose = "punch";
            enemyLunge = enemy.facing * 5;
        }

        // Recovery
        else {
            enemyLunge = enemy.facing * 2;
        }

    }

  // KRILLIN HURT REACTION
let enemyHurtTilt = 0;

if (enemyHitStun > 0) {
    const progress =
        1 - enemyHitStun / HIT_STUN_DURATION;

    enemyHurtTilt =
        Math.sin(progress * Math.PI) * 0.22 * enemy.facing;
}

    ctx.save();

ctx.translate(
    enemy.x + SPRITE_WIDTH / 2,
    enemy.y + SPRITE_HEIGHT
);

ctx.rotate(enemyHurtTilt);

ctx.translate(
    -(enemy.x + SPRITE_WIDTH / 2),
    -(enemy.y + SPRITE_HEIGHT)
);

ctx.globalAlpha = enemyHitFlash > 0 ? 0.4 : 1;

    drawKrillin(
        enemy.x + enemyLunge,
        enemy.y + enemyIdle,
        enemy.facing,
        enemyPose
    );

    ctx.restore();


    // =================================
    // ENEMY ATTACK WARNING
    // =================================

    if (enemyAttackWindup > 0) {

        ctx.fillStyle = "#ff3333";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "!",
            enemy.x + 16,
            enemy.y - 8
        );

    }

}

/* =================================
   21. DRAW COMPLETE GAME WORLD
================================= */


function drawGame() {

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.save();

    if (screenShakeTimer > 0 && !gameOver) {
        const shakeX =
            (Math.random() - 0.5) * SCREEN_SHAKE_INTENSITY * 2;

        const shakeY =
            (Math.random() - 0.5) * SCREEN_SHAKE_INTENSITY * 2;

        ctx.translate(shakeX, shakeY);
    }

    drawSky();
    drawClouds();
    drawMountains();
    drawGround();
    drawDecorations();
    drawFighters();
    drawHitSparks();

    ctx.restore();

    // PHASE 9D - K.O. DISPLAY
    if (gameOver) {

        ctx.save();

        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px monospace";
        ctx.textAlign = "center";

        ctx.fillText("K.O!", WIDTH / 2, HEIGHT / 2 - 15);

        ctx.font = "bold 16px monospace";

        ctx.fillText(
            matchWinner + " WINS!",
            WIDTH / 2,
            HEIGHT / 2 + 20
        );

        ctx.restore();
    }

  

if (roundState === "ready" || roundState === "fight") {

    ctx.save();

    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    
if (roundState === "fight") {

    const flashAlpha =
        Math.max(0, 1 - roundIntroTimer / 12) * 0.65;

    ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

}

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let progress = roundIntroTimer / READY_DURATION;
    let scale = 1;
    let alpha = 1;

    
if (roundState === "ready") {

    scale = 0.6 + progress * 0.4;
    alpha = Math.min(1, progress * 3);

}

else if (roundState === "fight") {

    let fightProgress = Math.min(1, roundIntroTimer / 12);

    scale = 1.5 - (0.5 * fightProgress);
    alpha = 1;

}


    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(scale, scale);

    ctx.globalAlpha = alpha;

    ctx.font = "bold 32px monospace";

    ctx.fillStyle =
        roundState === "ready" ? "#ffffff" : "#ffd43b";

    ctx.fillText(
        roundState === "ready" ? "READY?" : "FIGHT!",
        0,
        0
    );

    ctx.restore();
}



}


// TEMPORARY K.O. DISPLAY

if (gameOver) {

    ctx.save();

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";

    ctx.fillText("K.O.!", WIDTH / 2, HEIGHT / 2 - 15);

    ctx.font = "bold 14px monospace";

    ctx.fillText(
        matchWinner + " WINS!",
        WIDTH / 2,
        HEIGHT / 2 + 15
    );

    ctx.restore();
}


/* =================================
   22. MAIN GAME LOOP
================================= */

function gameLoop() {

    
if (roundState !== "playing" && !gameOver) {

    updateRoundIntro();

    drawGame();

    requestAnimationFrame(gameLoop);
    return;
}

  
    // PHASE 9C - HIT STOP FREEZE
    if (hitStopTimer > 0) {
        hitStopTimer--;

        drawGame();
        requestAnimationFrame(gameLoop);
        return;
    }

    
if (roundState !== "playing" && !gameOver) {

    updateRoundIntro();

    drawGame();

    requestAnimationFrame(gameLoop);
    return;
}


    // PHASE 9D - FREEZE AFTER K.O.

if (gameOver) {
    drawGame();
    requestAnimationFrame(gameLoop);
    return;
}
  
    frameCount++;
  
    // PHASE 9B - HIT-STUN COUNTDOWN
    if (playerHitStun > 0) {
        playerHitStun--;
    }

    if (enemyHitStun > 0) {
        enemyHitStun--;
    }
  
    // Update player movement
    movePlayer();

    // Update enemy AI
    moveEnemyAI();

    updateKnockback();

  

    // Apply physics
    applyPhysics(player);
    applyPhysics(enemy);

    // Update enemy attack
    enemyAttackPlayer();

    // Update player attack cooldown and animation
    if (playerAttackCooldown > 0) {
        playerAttackCooldown--;
    }

    if (playerAttackAnimation > 0) {
        playerAttackAnimation--;
    }

    // Update enemy attack cooldown
    if (enemyAttackCooldown > 0) {
        enemyAttackCooldown--;
    }

    // Update enemy punch animation
    if (enemyAttackAnimation > 0) {
        enemyAttackAnimation--;
    }

    // Update combo timer
    if (comboTimer > 0) {

        comboTimer--;

        if (comboTimer === 0) {

            comboCount = 0;

            updateComboCounter();

        }

    }

    // Update screen shake
    if (screenShakeTimer > 0) {
        screenShakeTimer--;
    }

    // Update hit flash effects
    if (enemyHitFlash > 0) {
        enemyHitFlash--;
    }

    if (playerHitFlash > 0) {
        playerHitFlash--;
    }

    // PHASE 9C - UPDATE HIT SPARKS
updateHitSparks();
  
    // Render game
    drawGame();

    requestAnimationFrame(gameLoop);

}


/* =================================
   23. INITIALIZE GAME
================================= */

// Set initial health bar values
updateHealthBars();
// PHASE 9E - REMATCH BUTTON
const rematchButton =
    document.getElementById("rematch-button");

rematchButton.addEventListener("click", () => {

    rematchButton.hidden = true;

    resetMatch();

});
// Start game
gameLoop();
