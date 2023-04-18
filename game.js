import Llama from './Llama.js';
import Obstacle from './Obstacle.js';
import Token from './Token.js';
import PowerUp from './PowerUp.js';
import ObjectPool from './ObjectPool.js';
// Import the Shield class at the top of the file
import Shield from './Shield.js';

const canvas = document.getElementById('gameCanvas');

const ctx = canvas.getContext('2d');
let lastTime = 0; // store the last time the game loop was run
let deltaTime = 0; // store the time since the last game loop run

let canRestart = false;

const powerUpTypes = ['slow_time', 'double_points', 'shield', 'magnet'];

let spawnRate = 0.2;
let spawnTimer = 0;
const SPAWN_INTERVAL = 0.1 / spawnRate;
const BASE_OBSTACLE_SPEED = 50;
let gameDifficulty = 1;
let difficultyIncreaseInterval = 10; // increase difficulty every 10 seconds
let difficultyIncreaseAmount = 0.1; // increase difficulty by 0.1
let timeSinceLastDifficultyIncrease = 0;
const DIFFICULTY_MODIFIER = 2;

let slowTimeActive = false;
let slowTimeTimer = 0;
const SLOW_TIME_DURATION = 5; // 5 seconds
const SLOW_TIME_FACTOR = 0.5; // 50% speed reduction

let doublePointsActive = false;
let doublePointsTimer = 0;
const DOUBLE_POINTS_DURATION = 5; // 5 seconds

const MAGNET_DURATION = 10;
let magnetActive = false;
let magnetTimer = 0;
const ATTRACTION_RANGE = 100;
const ATTRACTION_STRENGTH = 1000; // Increase this value to make the attraction stronger

const GameState = {
  PAUSED: 'paused',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver',
};
let gameState = GameState.PLAYING;

let llama = new Llama(canvas.width / 2, canvas.height / 2, 62.5, 90.75, canvas);

window.addEventListener('resize', () => {
  setCanvasSize();
});

function setCanvasSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;

  if (aspectRatio > 1) {
    // Landscape or wide screens
    canvas.width = 600;
    canvas.height = 400;
  } else {
    // Portrait or narrow screens
    canvas.width = width < 768 ? width : 400;
    canvas.height = height < 768 ? height : height;
  }

  if (width >= 768 && height >= 600) {
    canvas.height = 600;
  }

  // Update the llama's position
  if (llama) {
    llama.x = (canvas.width / 2) - (llama.width / 2);
    //llama.y = (canvas.height / 2) - (llama.height / 2);
  }
}
setCanvasSize();
// Create a shield instance after creating the llama instance
let shield = new Shield(0, 0, 50, canvas);

let obstacles = [];
let knowledgeTokens = [];
let powerUps = [];
let score = 0;

const objectPool = new ObjectPool();

let startTime = 0;

let gameOverTime = 0;

function gameLoop(currentTime) {
  if (gameState === GameState.PAUSED) {
    lastTime = currentTime; // Reset lastTime to avoid a large deltaTime value
    requestAnimationFrame(gameLoop);
    return;
  }

  if (gameState === GameState.PLAYING) {
    if (startTime === 0) {
      startTime = currentTime; // Set the starting time of the game
    }
    deltaTime = (currentTime - lastTime) / 1000;

    update(deltaTime);
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw the objects in the game
    draw();
  }

  if (gameState === GameState.GAME_OVER) {
    clearObjects();
    gameOverTime = currentTime; // Set the game over time
    showGameOverScreen();
    console.log(gameState + ' ' + gameDifficulty);
  }

  lastTime = currentTime; // Update lastTime
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
function draw() {

  drawLlama();
  drawObstacles();
  drawKnowledgeTokens();
  drawPowerUps();
  drawShield();
  drawScore();

  /* const llamaCenterX = llama.x + llama.width / 2;
  const llamaCenterY = llama.y + llama.height / 2;
  // Draw the attraction range for testing purposes
  ctx.beginPath();
  ctx.arc(llamaCenterX, llamaCenterY, ATTRACTION_RANGE, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.stroke();
  ctx.closePath(); */
}

function update(deltaTime) {

  if (gameState !== GameState.PLAYING) {
    return;
  }
  updateLlama(deltaTime);
  updateObstacles(deltaTime);
  updateKnowledgeTokens(deltaTime);
  updatePowerUps(deltaTime);
  // Add the lines below
  attractObjects(knowledgeTokens, deltaTime);
  attractObjects(powerUps, deltaTime);
  updateScore();
  checkCollisions();
  updateShield(deltaTime, llama);
  // update the difficulty based on the elapsed time
  updateDifficulty(deltaTime);

  // Update double points power-up timer
  if (doublePointsActive) {
    doublePointsTimer += deltaTime;
    if (doublePointsTimer >= DOUBLE_POINTS_DURATION) {
      doublePointsActive = false;
      doublePointsTimer = 0;
    }
  }

  // Update slow time power-up timer
  if (slowTimeActive) {
    slowTimeTimer += deltaTime;
    if (slowTimeTimer >= SLOW_TIME_DURATION) {
      slowTimeActive = false;
      slowTimeTimer = 0;
    }
  }

  // Update double points power-up timer
  if (magnetActive) {
    magnetTimer += deltaTime;
    if (magnetTimer >= MAGNET_DURATION) {
      magnetActive = false;
      magnetTimer = 0;
    }
  }

}

function attractObjects(objects, deltaTime) {
  objects.forEach((obj) => {
    const llamaCenterX = llama.x + llama.width / 2;
    const llamaCenterY = llama.y + llama.height / 2;

    const dx = llamaCenterX - obj.x;
    const dy = llamaCenterY - obj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    let attractionRange = ATTRACTION_RANGE;
    let attractionStrength = ATTRACTION_STRENGTH;

    if (magnetActive) {
      attractionRange *= 2;
      attractionStrength *= 2;
    }
    if (distance < attractionRange) {
      const attractionForce = ((attractionRange - distance) / attractionRange) * attractionStrength;
      const ax = (dx / distance) * attractionForce;
      const ay = (dy / distance) * attractionForce;

      obj.x += ax * deltaTime;
      obj.y += ay * deltaTime;
      console.log("Pulling");
    }
  });
}


function togglePause() {
  if (gameState === GameState.GAME_OVER) return;
  if (gameState === GameState.PLAYING) {
    gameState = GameState.PAUSED;
  } else {
    gameState = GameState.PLAYING;
  }
}

function updateLlama(deltaTime) {
  llama.update(deltaTime);
}

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  if (doublePointsActive) {
    ctx.fillText(`Score: ${Math.ceil(score)} X2`, 10, 30); // Draw the score on the canvas
  } else {
    ctx.fillText(`Score: ${Math.ceil(score)}`, 10, 30); // Draw the score on the canvas
  }

}
function drawLlama() {
  llama.draw(ctx)

}

function clearObjects() {
  // Clear all obstacles, knowledge tokens, and power-ups
  obstacles.forEach((obstacle) => objectPool.release(obstacle));
  knowledgeTokens.forEach((token) => objectPool.release(token));
  powerUps.forEach((powerUp) => objectPool.release(powerUp));

  obstacles = []; // reset obstacles array to empty array
  knowledgeTokens = [];
  powerUps = [];

  objectPool.reset();
}
function resetGame(currentTime) {

  // Reset the llama's position and velocity
  llama.x = (canvas.width / 2) - (llama.width / 2);
  llama.y = canvas.height / 2;
  llama.velocityY = 0;
  clearObjects();

  spawnTimer = 0;

  gameDifficulty = 1;
  spawnRate = 1;
  // Reset the score
  score = 0;

  lastTime = currentTime; // store the last time the game loop was run
  deltaTime = 0; // store the time since the last game loop run
  timeSinceLastDifficultyIncrease = 0;

}

function updateObstacles(deltaTime) {


  // spawn new obstacles based on spawn rate
  spawnTimer += deltaTime;
  if (spawnTimer >= SPAWN_INTERVAL) {
    spawnTimer -= SPAWN_INTERVAL;

    if (Math.random() < getObstacleSpawnProbability(deltaTime)) {
      const obstacleSpeed = BASE_OBSTACLE_SPEED + gameDifficulty * BASE_OBSTACLE_SPEED;

      const obstacle = objectPool.get(Obstacle);

      obstacle.x = canvas.width;
      obstacle.y = Math.random() * (canvas.height - 50)
      obstacle.width = 307;
      obstacle.height = 41;
      obstacle.speed = obstacleSpeed;
      obstacles.push(obstacle);
    }
  }

  // update the position of each obstacle
  obstacles.forEach((obstacle) => {
    const speedFactor = slowTimeActive ? SLOW_TIME_FACTOR : 1;
    obstacle.x -= obstacle.speed * deltaTime * speedFactor;
  });

  // remove obstacles that have gone off the screen
  obstacles = obstacles.filter((obstacle) => {
    if (obstacle.x + obstacle.width <= 0) {
      objectPool.release(obstacle);
      return false;
    }
    return true;
  });


}

function updateShield(deltaTime, llama) {
  shield.update(deltaTime, llama);
}
// Draw the shield in the draw() function
function drawShield() {
  shield.draw(ctx);
}
function updateDifficulty(deltaTime) {

  timeSinceLastDifficultyIncrease += deltaTime;
  if (timeSinceLastDifficultyIncrease >= difficultyIncreaseInterval) {
    gameDifficulty += difficultyIncreaseAmount;
    timeSinceLastDifficultyIncrease -= difficultyIncreaseInterval;
  }
}

function drawObstacles() {

  obstacles.forEach((obstacle) => obstacle.draw(ctx));
}
function getObstacleSpawnProbability(deltaTime) {
  const baseSpawnProbability = 5; // Increase this value
  const maxSpawnProbability = 0.5;
  const difficultyFactor = gameDifficulty * DIFFICULTY_MODIFIER;
  const spawnProbability = baseSpawnProbability + difficultyFactor;

  return Math.min(spawnProbability * deltaTime, maxSpawnProbability);
}

function updateKnowledgeTokens(deltaTime) {
  if (Math.random() < 0.005) {
    const token = objectPool.get(Token);
    token.x = canvas.width;
    token.y = Math.random() * (canvas.height - 10);
    token.width = 50;
    token.height = 50;
    knowledgeTokens.push(token);
  }

  knowledgeTokens = knowledgeTokens.filter((token) => {
    token.update();
    if (token.x + token.width <= 0) {
      objectPool.release(token);
      return false;
    }
    return true;
  });
}
function drawKnowledgeTokens() {
  knowledgeTokens.forEach((token) => token.draw(ctx));
}

function updatePowerUps(deltaTime) {
  if (Math.random() < 0.002) {
    const powerUp = objectPool.get(PowerUp);
    powerUp.x = canvas.width;
    powerUp.y = Math.random() * (canvas.height - 20);
    powerUp.width = 50;
    powerUp.height = 50;

    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    powerUp.setType(randomType);

    powerUps.push(powerUp);
  }

  powerUps = powerUps.filter((powerUp) => {
    const speedFactor = slowTimeActive ? SLOW_TIME_FACTOR : 1;
    powerUp.x -= powerUp.speed * speedFactor;
    powerUp.update();
    if (powerUp.x + powerUp.width <= 0) {
      objectPool.release(powerUp);
      return false;
    }
    return true;
  });
}

function drawPowerUps() {
  powerUps.forEach((powerUp) => powerUp.draw(ctx));
}

function checkCollisions() {

  knowledgeTokens.forEach((token, index) => {
    if (llama.collidesWith(token)) {
      // Handle collision with knowledge token (e.g., increase score)
      if (doublePointsActive) {
        score += 200;
      } else {
        score += 100;
      }
      // Remove the token from the array and release it back to the object pool
      objectPool.release(token);
      knowledgeTokens.splice(index, 1);
    }
  });

  powerUps.forEach((powerUp, index) => {
    if (llama.collidesWith(powerUp)) {
      // Handle collision with power-up
      if (powerUp.type === 'slow_time') {
        console.log('Slow time power-up collected');
        slowTimeActive = true;
        slowTimeTimer = 0;
      } else if (powerUp.type === 'double_points') {
        console.log('Double points power-up collected');
        doublePointsActive = true;
        doublePointsTimer = 0;
      } else if (powerUp.type === 'shield') {
        console.log('Shield power-up collected');
        shield.activate(); // Activate the shield for 5 seconds
      } else if (powerUp.type === 'magnet') {
        console.log('Magnet power-up collected')
        magnetActive = true;
      }

      // Remove the power-up from the array and release it back to the object pool
      objectPool.release(powerUp);
      powerUps.splice(index, 1);
    }
  });

  obstacles.forEach((obstacle) => {
    if (llama.collidesWith(obstacle)) {
      console.log('Collision with obstacle!');
      if (shield.active) {
        // If the shield is active, just remove the obstacle and deactivate the shield
        objectPool.release(obstacle);
        obstacles.splice(obstacles.indexOf(obstacle), 1);
        shield.deactivate()
      } else {
        // If the shield is active, just remove the obstacle and deactivate the shield
        objectPool.release(obstacle);
        obstacles.splice(obstacles.indexOf(obstacle), 1);
        // Set the game state to GAME_OVER instead of calling resetGame()
        updateHighScore(Math.floor(score));
        gameState = GameState.GAME_OVER;
      }
    }
  });
}
function getHighScore() {
  const highScore = localStorage.getItem('highScore');
  return highScore ? parseInt(highScore) : 0;
}
function updateHighScore(newScore) {
  const currentHighScore = getHighScore();
  if (newScore > currentHighScore) {
    localStorage.setItem('highScore', newScore);
  }
}

function updateScore() {
  // Increment the score based on elapsed time (e.g., every second)
  if (doublePointsActive) {
    score += 0.2;
  } else {
    score += 0.1;
  }

}

document.addEventListener('visibilitychange', () => {
  togglePause();
});

canvas.addEventListener('mousedown', jump);
canvas.addEventListener('touchstart', jump);

canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchstart', handleCanvasClick);

function handleCanvasClick() {
  if (gameState === GameState.GAME_OVER && canRestart) {
    gameState = GameState.PLAYING;
    resetGame(lastTime);
    canRestart = false; // Reset the canRestart flag

  }
}

function jump(event) {
  if (gameState === GameState.PLAYING) {
    llama.jump();
  }
}

function showGameOverScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  const gameOverText = 'Game Over';
  const gameOverTextWidth = ctx.measureText(gameOverText).width;
  ctx.fillText(gameOverText, (canvas.width / 2) - (gameOverTextWidth / 2), canvas.height / 2 - 100);

  ctx.font = '24px Arial';
  const restartText = 'Click to restart';
  const restartTextWidth = ctx.measureText(restartText).width;
  ctx.fillText(restartText, (canvas.width / 2) - (restartTextWidth / 2), canvas.height / 2 + 100);

  ctx.font = '32px Arial';
  const highScoreText = `High Score: ${getHighScore()}`;
  const highScoreTextWidth = ctx.measureText(highScoreText).width;
  ctx.fillText(highScoreText, (canvas.width / 2) - (highScoreTextWidth / 2), canvas.height / 2 - 30);

  ctx.font = '32px Arial';
  const scoreText = `Score: ${Math.floor(score)}`;
  const scoreTextWidth = ctx.measureText(scoreText).width;
  ctx.fillText(scoreText, (canvas.width / 2) - (scoreTextWidth / 2), canvas.height / 2 + 30);

  setTimeout(() => {
    canRestart = true;
  }, 1500);


}




canvas.addEventListener('click', () => {
  if (gameState === GameState.GAME_OVER && canRestart) {
    gameState = GameState.PLAYING;
    resetGame();
    canRestart = false; // Reset the canRestart flag
    //requestAnimationFrame(gameLoop);

  }
});