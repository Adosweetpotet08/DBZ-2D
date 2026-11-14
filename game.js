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


let roundState = "ready";
let roundIntroTimer = 0;

const READY_DURATION = 60;
const FIGHT_DURATION = 45;

let roundIntroShakeTimer = 0;
const ROUND_INTRO_SHAKE_DURATION = 8;
const ROUND_INTRO_SHAKE_INTENSITY = 4;

const ATTACK_DAMAGE = 10;
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
   Goku's body is drawn the same in every pose; only the
   arms change between the standing and punch poses.
================================= */

const GOKU_HEIGHT = 54;   // sprite height in pixels
const GOKU_ANCHOR_X = 14; // column that lines up with the middle of his body

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
    const BLK = "#000000"; // Black outline
    const HRG = "#606060"; // Hair highlight (gray)
    const HRL = "#7c7c7c"; // Hair highlight (light gray)
    const SKL = "#f3c5a3"; // Skin light
    const SKM = "#df8c68"; // Skin mid
    const SKD = "#924a3d"; // Skin shadow
    const ORG = "#fb5303"; // Gi orange
    const ORM = "#d5430d"; // Gi orange-red
    const ORD = "#a72a00"; // Gi dark orange
    const ORX = "#580b00"; // Gi darkest shadow
    const BLU = "#1c3e86"; // Blue undershirt / wristbands
    const BLL = "#2651b0"; // Blue light
    const BLD = "#0b1e46"; // Blue dark
    const RED = "#f23252"; // Boot red
    const YEL = "#fbd139"; // Boot yellow
    const WHT = "#f4f4f4"; // White highlight

    // --- BODY (same in every pose) ---
    // Black outline
    p(20, 0, 3, 1, BLK);
    p(17, 1, 1, 1, BLK);
    p(19, 1, 2, 1, BLK);
    p(16, 2, 1, 1, BLK);
    p(18, 2, 2, 2, BLK);
    p(15, 3, 1, 1, BLK);
    p(17, 3, 1, 8, BLK);
    p(14, 4, 1, 2, BLK);
    p(18, 4, 1, 7, BLK);
    p(21, 4, 6, 1, BLK);
    p(16, 5, 1, 7, BLK);
    p(20, 5, 1, 1, BLK);
    p(27, 5, 1, 1, BLK);
    p(13, 6, 1, 6, BLK);
    p(23, 6, 4, 1, BLK);
    p(28, 6, 1, 1, BLK);
    p(21, 7, 4, 1, BLK);
    p(27, 7, 1, 1, BLK);
    p(29, 7, 1, 1, BLK);
    p(20, 8, 4, 1, BLK);
    p(25, 8, 2, 1, BLK);
    p(11, 9, 2, 3, BLK);
    p(14, 9, 2, 6, BLK);
    p(19, 9, 4, 2, BLK);
    p(24, 9, 1, 1, BLK);
    p(3, 10, 2, 1, BLK);
    p(10, 10, 1, 8, BLK);
    p(23, 10, 1, 1, BLK);
    p(4, 11, 3, 1, BLK);
    p(19, 11, 2, 1, BLK);
    p(26, 11, 1, 1, BLK);
    p(5, 12, 3, 1, BLK);
    p(9, 12, 1, 1, BLK);
    p(11, 12, 1, 1, BLK);
    p(17, 12, 2, 4, BLK);
    p(20, 12, 2, 1, BLK);
    p(23, 12, 2, 1, BLK);
    p(28, 12, 1, 1, BLK);
    p(6, 13, 3, 1, BLK);
    p(13, 13, 1, 4, BLK);
    p(19, 13, 1, 5, BLK);
    p(21, 13, 2, 1, BLK);
    p(24, 13, 4, 1, BLK);
    p(29, 13, 1, 2, BLK);
    p(0, 14, 3, 1, BLK);
    p(7, 14, 2, 1, BLK);
    p(16, 14, 1, 1, BLK);
    p(20, 14, 1, 5, BLK);
    p(22, 14, 2, 4, BLK);
    p(25, 14, 4, 1, BLK);
    p(30, 14, 1, 1, BLK);
    p(2, 15, 4, 1, BLK);
    p(14, 15, 1, 3, BLK);
    p(24, 15, 1, 4, BLK);
    p(4, 16, 6, 1, BLK);
    p(11, 16, 1, 3, BLK);
    p(18, 16, 1, 1, BLK);
    p(25, 16, 1, 4, BLK);
    p(6, 17, 4, 3, BLK);
    p(12, 17, 1, 3, BLK);
    p(15, 17, 2, 1, BLK);
    p(3, 18, 3, 1, BLK);
    p(17, 18, 2, 1, BLK);
    p(22, 18, 1, 1, BLK);
    p(5, 19, 1, 1, BLK);
    p(19, 19, 1, 1, BLK);
    p(21, 19, 1, 3, BLK);
    p(7, 20, 3, 1, BLK);
    p(9, 21, 3, 1, BLK);
    p(12, 22, 1, 2, BLK);
    p(20, 22, 1, 2, BLK);
    p(9, 23, 3, 1, BLK);
    p(6, 24, 3, 1, BLK);
    p(21, 24, 2, 1, BLK);
    p(6, 25, 1, 3, BLK);
    p(23, 25, 1, 1, BLK);
    p(5, 28, 1, 3, BLK);
    p(10, 28, 1, 3, BLK);
    p(22, 29, 1, 1, BLK);
    p(9, 30, 1, 1, BLK);
    p(21, 30, 1, 2, BLK);
    p(4, 31, 1, 3, BLK);
    p(8, 31, 1, 1, BLK);
    p(11, 31, 3, 1, BLK);
    p(7, 32, 1, 3, BLK);
    p(13, 32, 1, 2, BLK);
    p(20, 32, 1, 2, BLK);
    p(3, 34, 1, 4, BLK);
    p(12, 34, 1, 2, BLK);
    p(21, 34, 1, 2, BLK);
    p(8, 35, 1, 1, BLK);
    p(9, 36, 1, 2, BLK);
    p(11, 36, 1, 1, BLK);
    p(22, 36, 1, 2, BLK);
    p(8, 37, 1, 2, BLK);
    p(10, 37, 1, 2, BLK);
    p(4, 38, 2, 1, BLK);
    p(23, 38, 1, 3, BLK);
    p(6, 39, 2, 1, BLK);
    p(9, 39, 1, 2, BLK);
    p(8, 40, 1, 1, BLK);
    p(16, 40, 2, 1, BLK);
    p(7, 41, 1, 1, BLK);
    p(15, 41, 1, 1, BLK);
    p(17, 41, 1, 4, BLK);
    p(24, 41, 1, 1, BLK);
    p(6, 42, 1, 4, BLK);
    p(14, 42, 1, 4, BLK);
    p(25, 42, 1, 3, BLK);
    p(18, 45, 1, 1, BLK);
    p(24, 45, 1, 1, BLK);
    p(7, 46, 1, 4, BLK);
    p(13, 46, 1, 1, BLK);
    p(19, 46, 1, 7, BLK);
    p(22, 46, 2, 1, BLK);
    p(11, 47, 2, 1, BLK);
    p(22, 47, 1, 1, BLK);
    p(11, 48, 1, 1, BLK);
    p(21, 48, 1, 2, BLK);
    p(10, 49, 1, 1, BLK);
    p(6, 50, 1, 2, BLK);
    p(9, 50, 1, 1, BLK);
    p(22, 50, 2, 1, BLK);
    p(8, 51, 1, 3, BLK);
    p(24, 51, 1, 2, BLK);
    p(5, 52, 1, 2, BLK);
    p(20, 52, 4, 1, BLK);
    p(6, 53, 2, 1, BLK);

    // Hair highlight (gray)
    p(17, 2, 1, 1, HRG);
    p(16, 3, 1, 2, HRG);
    p(15, 4, 1, 5, HRG);
    p(21, 5, 3, 1, HRG);
    p(14, 6, 1, 3, HRG);
    p(19, 6, 4, 1, HRG);
    p(19, 7, 2, 1, HRG);
    p(19, 8, 1, 1, HRG);
    p(7, 11, 1, 1, HRG);
    p(17, 11, 2, 1, HRG);
    p(21, 11, 5, 1, HRG);
    p(8, 12, 1, 1, HRG);
    p(12, 12, 2, 1, HRG);
    p(16, 12, 1, 2, HRG);
    p(19, 12, 1, 1, HRG);
    p(22, 12, 1, 1, HRG);
    p(25, 12, 3, 1, HRG);
    p(9, 13, 1, 3, HRG);
    p(11, 13, 2, 3, HRG);
    p(20, 13, 1, 1, HRG);
    p(23, 13, 1, 1, HRG);
    p(3, 14, 4, 1, HRG);
    p(21, 14, 1, 2, HRG);
    p(6, 15, 3, 1, HRG);
    p(12, 16, 1, 1, HRG);
    p(13, 17, 1, 1, HRG);
    p(14, 18, 1, 1, HRG);
    p(18, 19, 1, 2, HRG);

    // Hair highlight (light gray)
    p(19, 0, 1, 1, HRL);
    p(18, 1, 1, 1, HRL);
    p(24, 5, 3, 1, HRL);
    p(27, 6, 1, 1, HRL);
    p(25, 7, 2, 1, HRL);
    p(28, 7, 1, 1, HRL);
    p(24, 8, 1, 1, HRL);
    p(23, 9, 1, 1, HRL);
    p(28, 13, 1, 1, HRL);
    p(24, 14, 1, 1, HRL);
    p(25, 15, 1, 1, HRL);
    p(21, 29, 1, 1, HRL);

    // Skin light
    p(18, 17, 1, 1, SKL);
    p(21, 17, 1, 2, SKL);
    p(19, 18, 1, 1, SKL);
    p(20, 19, 1, 3, SKL);
    p(17, 21, 3, 2, SKL);
    p(16, 23, 3, 1, SKL);
    p(13, 25, 3, 1, SKL);
    p(18, 25, 2, 1, SKL);
    p(14, 26, 4, 1, SKL);
    p(19, 26, 1, 1, SKL);
    p(8, 28, 2, 2, SKL);
    p(8, 30, 1, 1, SKL);
    p(6, 31, 1, 2, SKL);
    p(5, 32, 1, 1, SKL);
    p(21, 32, 1, 1, SKL);
    p(5, 35, 3, 1, SKL);
    p(4, 36, 2, 2, SKL);
    p(8, 36, 1, 1, SKL);
    p(6, 38, 2, 1, SKL);

    // Skin mid
    p(15, 15, 2, 2, SKM);
    p(17, 16, 1, 2, SKM);
    p(21, 16, 1, 1, SKM);
    p(10, 18, 1, 3, SKM);
    p(13, 18, 1, 4, SKM);
    p(11, 19, 1, 2, SKM);
    p(14, 19, 1, 4, SKM);
    p(15, 20, 2, 3, SKM);
    p(13, 23, 1, 2, SKM);
    p(15, 23, 1, 1, SKM);
    p(12, 24, 1, 1, SKM);
    p(14, 24, 1, 1, SKM);
    p(16, 25, 1, 1, SKM);
    p(6, 28, 2, 1, SKM);
    p(6, 30, 1, 1, SKM);
    p(5, 31, 1, 1, SKM);
    p(4, 35, 1, 1, SKM);
    p(6, 36, 1, 2, SKM);

    // Skin shadow
    p(15, 18, 1, 2, SKD);
    p(12, 20, 1, 2, SKD);
    p(13, 22, 1, 1, SKD);
    p(14, 23, 1, 1, SKD);
    p(19, 23, 1, 1, SKD);
    p(15, 24, 4, 1, SKD);
    p(17, 25, 1, 1, SKD);
    p(18, 26, 1, 1, SKD);
    p(6, 29, 2, 1, SKD);
    p(7, 30, 1, 2, SKD);
    p(7, 36, 1, 2, SKD);

    // Gi orange
    p(11, 24, 1, 1, ORG);
    p(10, 25, 1, 1, ORG);
    p(12, 25, 1, 1, ORG);
    p(20, 25, 2, 1, ORG);
    p(11, 26, 1, 3, ORG);
    p(21, 26, 1, 2, ORG);
    p(12, 27, 2, 1, ORG);
    p(12, 28, 1, 1, ORG);
    p(14, 28, 1, 1, ORG);
    p(13, 29, 1, 2, ORG);
    p(15, 29, 1, 1, ORG);
    p(16, 30, 1, 2, ORG);
    p(20, 30, 1, 2, ORG);
    p(17, 31, 3, 1, ORG);
    p(13, 34, 1, 2, ORG);
    p(15, 35, 2, 4, ORG);
    p(18, 35, 1, 3, ORG);
    p(20, 35, 1, 6, ORG);
    p(12, 36, 1, 6, ORG);
    p(14, 36, 1, 4, ORG);
    p(21, 36, 1, 6, ORG);
    p(13, 37, 1, 4, ORG);
    p(11, 38, 1, 4, ORG);
    p(22, 39, 1, 3, ORG);
    p(15, 40, 1, 1, ORG);
    p(18, 40, 1, 1, ORG);
    p(14, 41, 1, 1, ORG);
    p(19, 41, 1, 1, ORG);
    p(20, 42, 1, 1, ORG);
    p(24, 43, 1, 1, ORG);
    p(23, 44, 1, 1, ORG);

    // Gi orange-red
    p(9, 24, 2, 1, ORM);
    p(20, 34, 1, 1, ORM);
    p(8, 41, 1, 1, ORM);
    p(7, 42, 1, 3, ORM);
    p(24, 42, 1, 1, ORM);
    p(13, 44, 1, 1, ORM);
    p(19, 44, 1, 1, ORM);
    p(8, 45, 1, 1, ORM);
    p(12, 45, 1, 1, ORM);
    p(20, 45, 3, 1, ORM);
    p(9, 46, 3, 1, ORM);

    // Gi dark orange
    p(19, 24, 2, 1, ORD);
    p(11, 25, 1, 1, ORD);
    p(12, 26, 2, 1, ORD);
    p(13, 28, 1, 1, ORD);
    p(11, 29, 2, 2, ORD);
    p(14, 29, 1, 3, ORD);
    p(15, 30, 1, 2, ORD);
    p(16, 32, 4, 1, ORD);
    p(14, 34, 2, 1, ORD);
    p(14, 35, 1, 1, ORD);
    p(17, 35, 1, 4, ORD);
    p(13, 36, 1, 1, ORD);
    p(11, 37, 1, 1, ORD);
    p(18, 38, 1, 1, ORD);
    p(22, 38, 1, 1, ORD);
    p(10, 39, 1, 5, ORD);
    p(15, 39, 2, 1, ORD);
    p(14, 40, 1, 1, ORD);
    p(19, 40, 1, 1, ORD);
    p(13, 41, 1, 2, ORD);
    p(18, 41, 1, 1, ORD);
    p(20, 41, 1, 1, ORD);
    p(11, 42, 2, 1, ORD);
    p(21, 42, 2, 1, ORD);
    p(11, 43, 1, 1, ORD);

    // Gi darkest shadow
    p(19, 35, 1, 5, ORX);
    p(17, 39, 2, 1, ORX);
    p(9, 41, 1, 5, ORX);
    p(23, 41, 1, 3, ORX);
    p(8, 42, 1, 3, ORX);
    p(18, 42, 2, 2, ORX);
    p(12, 43, 2, 1, ORX);
    p(20, 43, 3, 2, ORX);
    p(10, 44, 3, 1, ORX);
    p(18, 44, 1, 1, ORX);
    p(24, 44, 1, 1, ORX);
    p(7, 45, 1, 1, ORX);
    p(10, 45, 2, 1, ORX);
    p(13, 45, 1, 1, ORX);
    p(19, 45, 1, 1, ORX);
    p(23, 45, 1, 1, ORX);
    p(12, 46, 1, 1, ORX);

    // Blue undershirt / wristbands
    p(8, 25, 2, 1, BLU);
    p(10, 26, 1, 1, BLU);
    p(20, 26, 1, 2, BLU);
    p(7, 27, 2, 1, BLU);
    p(14, 27, 6, 1, BLU);
    p(22, 27, 1, 1, BLU);
    p(16, 29, 1, 1, BLU);
    p(17, 30, 3, 1, BLU);
    p(14, 32, 2, 1, BLU);
    p(5, 33, 2, 2, BLU);
    p(16, 34, 4, 1, BLU);
    p(10, 47, 1, 1, BLU);
    p(20, 47, 1, 2, BLU);
    p(20, 51, 2, 1, BLU);

    // Blue light
    p(7, 25, 1, 1, BLL);
    p(22, 26, 1, 1, BLL);
    p(8, 46, 1, 3, BLL);
    p(10, 48, 1, 1, BLL);
    p(7, 52, 1, 1, BLL);

    // Blue dark
    p(7, 26, 3, 1, BLD);
    p(9, 27, 2, 1, BLD);
    p(15, 28, 6, 1, BLD);
    p(17, 29, 4, 1, BLD);
    p(14, 33, 6, 1, BLD);
    p(21, 33, 1, 1, BLD);
    p(4, 34, 1, 1, BLD);
    p(20, 46, 1, 1, BLD);
    p(9, 49, 1, 1, BLD);
    p(20, 50, 1, 1, BLD);

    // Boot red
    p(21, 46, 1, 2, RED);
    p(9, 47, 1, 2, RED);
    p(8, 49, 1, 1, RED);
    p(21, 50, 1, 1, RED);
    p(7, 51, 1, 1, RED);
    p(22, 51, 2, 1, RED);
    p(6, 52, 1, 1, RED);

    // Boot yellow
    p(20, 49, 1, 1, YEL);
    p(7, 50, 2, 1, YEL);

    // White highlight
    p(21, 28, 1, 1, WHT);

    // --- ARMS (change with the pose) ---
    if (pose === "punch") {

        // Black outline
        p(34, 24, 4, 1, BLK);
        p(22, 25, 1, 1, BLK);
        p(24, 25, 10, 1, BLK);
        p(38, 25, 1, 5, BLK);
        p(23, 29, 11, 1, BLK);
        p(34, 30, 4, 1, BLK);

        // Skin light
        p(34, 25, 4, 2, SKL);
        p(27, 26, 4, 2, SKL);
        p(34, 27, 3, 1, SKL);

        // Skin mid
        p(27, 28, 4, 1, SKM);
        p(34, 28, 3, 2, SKM);
        p(37, 29, 1, 1, SKM);

        // Skin shadow
        p(37, 27, 1, 2, SKD);

        // Blue undershirt / wristbands
        p(23, 27, 4, 2, BLU);
        p(31, 27, 3, 2, BLU);
        p(22, 28, 1, 1, BLU);

        // Blue light
        p(23, 26, 4, 1, BLL);
        p(31, 26, 3, 1, BLL);

    } else {

        // Black outline
        p(23, 26, 1, 2, BLK);
        p(22, 28, 1, 1, BLK);
        p(23, 30, 1, 2, BLK);
        p(24, 32, 1, 2, BLK);
        p(25, 34, 1, 4, BLK);
        p(24, 38, 1, 1, BLK);

        // Skin light
        p(22, 31, 1, 2, SKL);
        p(24, 34, 1, 4, SKL);
        p(23, 37, 1, 1, SKL);

        // Skin mid
        p(22, 30, 1, 1, SKM);
        p(22, 35, 2, 1, SKM);
        p(23, 36, 1, 1, SKM);

        // Blue undershirt / wristbands
        p(23, 32, 1, 3, BLU);
        p(22, 33, 1, 1, BLU);

        // Blue light
        p(22, 25, 1, 1, BLL);

        // Blue dark
        p(22, 34, 1, 1, BLD);

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

// Start game
gameLoop();
