import Llama from './Llama.js';
import Obstacle from './Obstacle.js';
import Token from './Token.js';
import PowerUp from './PowerUp.js';
import ObjectPool from './ObjectPool.js';

const canvas = document.getElementById('gameCanvas');

const ctx = canvas.getContext('2d');
let lastTime = 0; // store the last time the game loop was run
let deltaTime = 0; // store the time since the last game loop run

let timeElapsed=0;

let spawnRate = 1;
let spawnTimer = 0;
const SPAWN_INTERVAL = 0.1 / spawnRate;
const BASE_OBSTACLE_SPEED = 50;
let gameDifficulty = 1;
let difficultyIncreaseInterval = 10; // increase difficulty every 10 seconds
let difficultyIncreaseAmount = 0.1; // increase difficulty by 0.1
let timeSinceLastDifficultyIncrease = 0;
const DIFFICULTY_MODIFIER=2;

let slowTimeActive = false;
let slowTimeTimer = 0;
const SLOW_TIME_DURATION = 5; // 5 seconds
const SLOW_TIME_FACTOR = 0.5; // 50% speed reduction

let doublePointsActive = false;
let doublePointsTimer = 0;
const DOUBLE_POINTS_DURATION = 5; // 5 seconds

let shieldActive = false;
let shieldTimer = 0;
const SHIELD_DURATION = 5; // 5 seconds

setCanvasSize();

  window.addEventListener('resize', () => {
    setCanvasSize();
  });
  function setCanvasSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width < 768 ? width : 400;
    canvas.height = height < 768 ? height : 600;
    if (width >= 768 && height >= 600) {
      canvas.height = 600;
    }
  }

let llama = new Llama(canvas.width / 2, canvas.height / 2, 30, 30, canvas);

let obstacles = [];
let knowledgeTokens = [];
let powerUps = [];
let score = 0;

const objectPool = new ObjectPool();

function gameLoop(currentTime) {
    // calculate the time since the last frame
    deltaTime = (currentTime - lastTime) / 1000;

    // update the game based on elapsed time
    update(deltaTime);

    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the objects in the game
    draw();

    // request the next animation frame
    lastTime = currentTime;
    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);
  function draw(){
    
    drawLlama();
    drawObstacles();
    drawKnowledgeTokens();
    drawPowerUps();

    drawScore();
  }

  function update(deltaTime) {
    updateLlama(deltaTime);
    updateObstacles(deltaTime);
    updateKnowledgeTokens(deltaTime);
    updatePowerUps(deltaTime);
    updateScore();
    checkCollisions();
    timeElapsed += deltaTime;
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


  // Update shield power-up timer
  if (shieldActive) {
    shieldTimer += deltaTime;
    if (shieldTimer >= SHIELD_DURATION) {
      shieldActive = false;
      shieldTimer = 0;
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

  }


function updateLlama(deltaTime) {
  llama.update(deltaTime);
}

function drawScore(){
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    if(doublePointsActive){
        ctx.fillText(`Score: ${Math.floor(score)} X2`, 10, 30); // Draw the score on the canvas
    }else{
        ctx.fillText(`Score: ${Math.floor(score)}`, 10, 30); // Draw the score on the canvas
    }
    
}
function drawLlama() {
    if(shieldActive){
        llama.draw(ctx, 'blue');
    }else{
        llama.draw(ctx, 'lime');
    }
  
}
function resetGame() {
    // Reset the llama's position and velocity
    llama.x = canvas.width / 2;
    llama.y = canvas.height / 2;
    llama.velocityY = 0;
  
    // Clear all obstacles, knowledge tokens, and power-ups
    obstacles.forEach((obstacle) => objectPool.release(obstacle));
    knowledgeTokens.forEach((token) => objectPool.release(token));
    powerUps.forEach((powerUp) => objectPool.release(powerUp));
  
    obstacles = []; // reset obstacles array to empty array
    knowledgeTokens = [];
    powerUps = [];
  
    objectPool.reset();
    spawnTimer = 0;

    gameDifficulty = 1;
    spawnRate = 1;
    // Reset the score
    score = 0;
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
        obstacle.width = 20;
        obstacle.height = 50;
        obstacle.speed=obstacleSpeed;
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
        console.log('obstacle removed from array:', obstacle);
        objectPool.release(obstacle);
        return false;
      }
      return true;
    });
  
    console.log('obstacles array:', obstacles);
  }
  
function updateDifficulty() {
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
  
function updateKnowledgeTokens() {
    if (Math.random() < 0.005) {
      const token = objectPool.get(Token);
      token.x = canvas.width;
      token.y = Math.random() * (canvas.height - 10);
      token.width = 25;
      token.height = 25;
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

  function updatePowerUps() {
    if (Math.random() < 0.002) {
      const powerUp = objectPool.get(PowerUp);
      powerUp.x = canvas.width;
      powerUp.y = Math.random() * (canvas.height - 20);
      powerUp.width = 20;
      powerUp.height = 20;
      
      const powerUpTypes = ['slow_time', 'double_points', 'shield'];
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
        if(doublePointsActive){
            score+=200;
        }else{
            score+=100;
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
            shieldActive = true;
            shieldTimer = 0;
          }
    
          // Remove the power-up from the array and release it back to the object pool
          objectPool.release(powerUp);
          powerUps.splice(index, 1);
        }
      });
    
      obstacles.forEach((obstacle) => {
        if (llama.collidesWith(obstacle)) {
          console.log('Collision with obstacle!');
          if (shieldActive) {
            // If the shield is active, just remove the obstacle and deactivate the shield
            objectPool.release(obstacle);
            obstacles.splice(obstacles.indexOf(obstacle), 1);
            shieldActive = false;
          } else {
            resetGame();
          }
        }
      });
  }



  function updateScore() {
    // Increment the score based on elapsed time (e.g., every second)
    if (doublePointsActive) {
        score += 0.2;
    } else {
        score += 0.1;
    }
  }


canvas.addEventListener('mousedown', jump);
canvas.addEventListener('touchstart', jump);

function jump(event) {
    
    llama.jump();
}

