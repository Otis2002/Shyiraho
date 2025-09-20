
let points = 1000;
let multiplier = 1;
let gameInterval;
let gameRunning = false;
let crashPoint = 0;

const pointsDisplay = document.getElementById('points');
const multiplierDisplay = document.getElementById('multiplier');
const messageDisplay = document.getElementById('message');
const betInput = document.getElementById('betAmount');
const startBtn = document.getElementById('startBtn');
const cashoutBtn = document.getElementById('cashoutBtn');
const plane = document.getElementById('plane');
const leaderboard = document.getElementById('leaderboard');

const riseSound = document.getElementById('riseSound');
const crashSound = document.getElementById('crashSound');

startBtn.addEventListener('click', startGame);
cashoutBtn.addEventListener('click', cashOut);

let aiPlayers = [
  {name: "AI1", points: 1000},
  {name: "AI2", points: 1000},
  {name: "AI3", points: 1000},
];

function startGame() {
  let bet = parseInt(betInput.value);
  if (gameRunning) return;
  if (!bet || bet <= 0) {
    messageDisplay.textContent = "Enter a valid bet!";
    return;
  }
  if (bet > points) {
    messageDisplay.textContent = "Not enough points!";
    return;
  }

  points -= bet;
  pointsDisplay.textContent = points;
  multiplier = 1;
  multiplierDisplay.textContent = multiplier.toFixed(2) + 'x';
  plane.style.bottom = "0px";
  plane.style.transform = "translateY(0px) rotate(0deg) scale(1)";
  messageDisplay.textContent = '';
  gameRunning = true;
  crashPoint = (Math.random() * 10 + 1);
  cashoutBtn.disabled = false;

  aiPlayers.forEach(ai => ai.cashOutPoint = Math.random() * crashPoint);

  riseSound.currentTime = 0;
  riseSound.play();

  gameInterval = setInterval(() => {
    multiplier += 0.1;
    multiplierDisplay.textContent = multiplier.toFixed(2) + 'x';

    let skyHeight = 300; 
    let newBottom = Math.min((multiplier * 20), skyHeight - 50);
    plane.style.transform = `translateY(-${newBottom}px) rotate(${multiplier * 3}deg)`;

    aiPlayers.forEach(ai => {
      if(!ai.cashedOut && multiplier >= ai.cashOutPoint){
        ai.points += Math.floor(100 * ai.cashOutPoint);
        ai.cashedOut = true;
      }
    });

    if (multiplier >= crashPoint) {
      endGame(false, bet);
    }
  }, 200);
}

function cashOut() {
  if (!gameRunning) return;
  let bet = parseInt(betInput.value);
  endGame(true, bet);
}

function endGame(cashedOut, bet) {
  clearInterval(gameInterval);
  gameRunning = false;
  cashoutBtn.disabled = true;

  plane.style.transform = `translateY(-150px) rotate(180deg) scale(0.5)`;
  plane.style.transition = "transform 0.6s ease-in";

  riseSound.pause();
  crashSound.currentTime = 0;
  crashSound.play();

  if (cashedOut) {
    let winnings = Math.floor(bet * multiplier);
    points += winnings;
    pointsDisplay.textContent = points;
    messageDisplay.textContent = `✅ You cashed out at ${multiplier.toFixed(2)}x and won ${winnings} points!`;
  } else {
    messageDisplay.textContent = `💥 Crashed at ${multiplier.toFixed(2)}x! You lost ${bet} points.`;
  }

  updateLeaderboard();
  aiPlayers.forEach(ai => ai.cashedOut = false);
}

function updateLeaderboard(){
  let allPlayers = [{name:"You", points}, ...aiPlayers];
  allPlayers.sort((a,b) => b.points - a.points);
  leaderboard.innerHTML = '';
  allPlayers.forEach(p => {
    let li = document.createElement('li');
    li.textContent = `${p.name}: ${p.points}`;
    leaderboard.appendChild(li);
  });
}
