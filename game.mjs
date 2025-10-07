// HTML interaksjon -----------------------------------------------------------
const canvas = document.getElementById("canvas"); // GI meg et ark
const brush = canvas.getContext("2d"); // Gi meg en malekost.

// GAME VARIABLES -------------------------------------------------------------

const MIN_SPEED = 3;
const MAX_SPEED = 5;
const NPC_PADDLE_SPEED = 4;

// Speed
const MAX_SPEED_INCREASE = 1.1;
const MAX_SPEED_X = 10;
const MAX_SPEED_Y = 10;

const PADDLE_PADDING = 10;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 75;

// Scoreboard
let playerScore = 0;
let npcScore = 0;

// Timer
let countdown = 90;
let gameOver = false;

// Cheat key
let npcFrozen = false;

const ball = {
  x: 310,
  y: 230,
  radius: 10,
  color: "#0fde20ff",
  speedX: 0,
  speedY: 0,
};

const paddle = {
  x: 10,
  y: 220,
  width: 20,
  height: 75,
  color: "#fffb1eff",
};

const npcPaddle = {
  x: canvas.width - PADDLE_PADDING - PADDLE_WIDTH,
  y: 0,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: "#fffb1eff",
};

// GAME ENGINE ----------------------------------------------------------------
function update() {
  if (!gameOver) {
    moveBall(ball);
    moveNpcPaddle();
    keepBallOnPitch(ball);
    dealWithCollision(paddle, ball);
    dealWithCollision(npcPaddle, ball);
  }
  draw();
  requestAnimationFrame(update);
}

function draw() {
  brush.clearRect(0, 0, canvas.width, canvas.height);

  // Midline
  brush.fillStyle = "white";
  for (let i = 0; i < canvas.height; i += 20) {
    brush.fillRect(canvas.width / 2 - 1, i, 2, 10);
  }

  // Ball & Paddles
  drawBall(ball);
  drawPaddle(paddle);
  drawPaddle(npcPaddle);

  // Score tracker
  brush.fillStyle = "white";
  brush.font = "32px impact";
  brush.fillText(playerScore, canvas.width / 2 - 60, 40);
  brush.fillText(npcScore, canvas.width / 2 + 40, 40);

  // Countdown
  brush.fillStyle = "white";
  brush.font = "24px arial";
  brush.fillText("Time " + countdown, 10, 30);

  if (gameOver) {
    drawGameOver();
  }
}

function refreshTimer() {
  if (gameOver) return;
  countdown--; // -1 second

  if (countdown <= 0) {
    gameOver = true;
    drawGameOver();
  } else {
    // Calls the function again
    setTimeout(refreshTimer, 1000);
  }
}
function drawGameOver() {
  brush.fillStyle = "black";
  brush.font = "58px impact";
  brush.textAlign = "center";
  brush.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
}

function init() {
  putBallInCenterOfPitch(ball);
  giveBallRandomSpeed(ball);
  update();
  refreshTimer();
}

init();

// GAME FUNCTIONS -------------------------------------------------------------

function moveNpcPaddle() {
  if (npcFrozen) {
    return;
  }

  const paddleCenter = npcPaddle.y + npcPaddle.height / 2;

  if (paddleCenter < ball.y - 10) {
    npcPaddle.y += NPC_PADDLE_SPEED;
  } else if (paddleCenter > ball.y + 10) {
    npcPaddle.y -= NPC_PADDLE_SPEED;
  }
}

function keepBallOnPitch(ball) {
  const leftBorder = ball.radius;
  const rightBorder = canvas.width - ball.radius;
  const topBorder = 0 + ball.radius;
  const bottomBorder = canvas.height - ball.radius;

  // If left/right, score and reset
  if (ball.x < leftBorder) {
    npcScore++;
    resetAfterGoal();
  } else if (ball.x > rightBorder) {
    playerScore++;
    resetAfterGoal();
  }

  // Bounce top/bottom
  if (ball.y <= topBorder || ball.y >= bottomBorder) {
    ball.speedY = ball.speedY * -1;
  }
}

function resetAfterGoal() {
  putBallInCenterOfPitch(ball);
  giveBallRandomSpeed(ball);
}

function putBallInCenterOfPitch(ball) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
}

function giveBallRandomSpeed(ball) {
  ball.speedX = randomNumberBetween(MIN_SPEED, MAX_SPEED);
  ball.speedY = randomNumberBetween(MIN_SPEED, MAX_SPEED);

  if (Math.random() > 0.5) {
    ball.speedX = ball.speedX * -1;
  }
  if (Math.random() > 0.5) {
    ball.speedY = ball.speedY * -1;
  }
}

function dealWithCollision(paddle, ball) {
  const paddleRight = paddle.x + paddle.width;
  const paddleLeft = paddle.x;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  // Collision
  if (
    ball.x + ball.radius > paddleLeft &&
    ball.x - ball.radius < paddleRight &&
    ball.y > paddleTop &&
    ball.y < paddleBottom
  ) {
    if (ball.speedX > 0) {
      ball.speedX = -ball.speedX;
      ball.x = paddleLeft - ball.radius; // Push to left
    } else {
      ball.speedX = -ball.speedX;
      ball.x = paddleRight + ball.radius; // Push to right
    }

    // Deflection
    const paddleCenter = paddle.y + paddle.height / 2;
    const pointOfImpact = (ball.y - paddleCenter) / (PADDLE_HEIGHT / 2); // -1 to 1
    ball.speedY = pointOfImpact * MAX_SPEED_Y;

    // Speed and limit
    ball.speedX *= MAX_SPEED_INCREASE;
    ball.speedY *= MAX_SPEED_INCREASE;

    if (ball.speedX > MAX_SPEED_X) ball.speedX = MAX_SPEED_X;
    if (ball.speedX < -MAX_SPEED_X) ball.speedX = -MAX_SPEED_X;
    if (ball.speedY > MAX_SPEED_Y) ball.speedY = MAX_SPEED_Y;
    if (ball.speedY < -MAX_SPEED_Y) ball.speedY = -MAX_SPEED_Y;
  }
}

function moveBall(ball) {
  ball.x += ball.speedX;
  ball.y += ball.speedY;
}

function drawBall(ball) {
  brush.beginPath();
  brush.fillStyle = ball.color;
  brush.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
  brush.fill();
}

function drawPaddle(paddle) {
  brush.fillStyle = paddle.color;
  brush.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawNpcPaddle(npcPaddle) {
  brush.fillStyle = npcPaddle.color;
  brush.fillRect(npcPaddle.x, npcPaddle.y, npcPaddle.width, npcPaddle.height);
}

// Freeze npc on "l" press
function freezeNpcPaddle() {
  npcFrozen = true;
  setTimeout(function () {
    npcFrozen = false;
  }, 2000);
}

// Teleport player on "c" press
function teleportPlayerPaddle() {
  paddle.y = ball.y - paddle.height / 2;
}

// Grow ball on "+" press
function growBall() {
  ball.radius += 5;
}

// Shrink ball on"-"" press
function shrinkBall() {
  ball.radius = Math.max(5, ball.radius - 5);
}

// Key listener
document.addEventListener("keydown", function (event) {
  if (event.key === "l") {
    freezeNpcPaddle();
  }
  if (event.key === "c") {
    teleportPlayerPaddle();
  }
  if (event.key === "+") {
    growBall();
  }
  if (event.key === "-") {
    shrinkBall();
  }
});

// UTILITY FUNCTIONS ----------------------------------------------------------

canvas.addEventListener("mousemove", onMouseMove);

function onMouseMove(event) {
  paddle.y = event.offsetY;
}

function randomNumberBetween(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}
