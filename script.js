// Variables
let startTime;
let updatedTime;
let difference;
let tInterval;
let running = false;
let savedTime = 0;
let timesList = [];
let currentScramble = "";
let spacePressed = false;
let isMobile = false;

// DOM Elements
const timerDisplay = document.getElementById('timer');
const scrambleDisplay = document.getElementById('scramble');
const newScrambleBtn = document.getElementById('new-scramble');
const resetBtn = document.getElementById('reset');
const timesListElement = document.getElementById('times');
const mobileInstructions = document.getElementById('mobile-instructions');

// Check if device is mobile
function checkMobile() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

// Initialize
isMobile = checkMobile();
if (isMobile) {
    mobileInstructions.style.display = 'block';
    timerDisplay.style.cursor = 'pointer';
} else {
    mobileInstructions.style.display = 'none';
}

generateScramble();
document.addEventListener('keydown', handleKeyPress);
timerDisplay.addEventListener('click', handleTap);
newScrambleBtn.addEventListener('click', generateScramble);
resetBtn.addEventListener('click', resetAll);

// Timer functions
function startTimer() {
    if (!running) {
        startTime = new Date().getTime() - savedTime;
        tInterval = setInterval(updateTimer, 10);
        running = true;
        if (isMobile) {
            timerDisplay.style.backgroundColor = '#ffcccc'; // Visual feedback
        }
    }
}

function stopTimer() {
    if (running) {
        clearInterval(tInterval);
        savedTime = difference;
        running = false;
        
        // Add to times list
        if (savedTime > 0) {
            timesList.push({
                time: savedTime,
                scramble: currentScramble
            });
            updateTimesList();
        }
        
        if (isMobile) {
            timerDisplay.style.backgroundColor = '#ccffcc'; // Visual feedback
            setTimeout(() => {
                timerDisplay.style.backgroundColor = '#eee';
            }, 300);
        }
    }
}

function resetTimer() {
    clearInterval(tInterval);
    savedTime = 0;
    difference = 0;
    running = false;
    timerDisplay.innerHTML = '00:00:00';
    if (isMobile) {
        timerDisplay.style.backgroundColor = '#eee';
    }
    generateScramble();
}

function resetAll() {
    resetTimer();
    timesList = [];
    updateTimesList();
}

function updateTimer() {
    updatedTime = new Date().getTime();
    difference = updatedTime - startTime;
    
    let hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);
    let milliseconds = Math.floor((difference % 1000) / 10);
    
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    milliseconds = (milliseconds < 10) ? "0" + milliseconds : milliseconds;
    
    timerDisplay.innerHTML = hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
}

// Scramble generator
function generateScramble() {
    const moves = ["U", "U'", "U2", "D", "D'", "D2", "L", "L'", "L2", "R", "R'", "R2", "F", "F'", "F2", "B", "B'", "B2"];
    const scrambleLength = 20;
    let scramble = [];
    
    for (let i = 0; i < scrambleLength; i++) {
        let randomMove = moves[Math.floor(Math.random() * moves.length)];
        
        // Avoid consecutive moves on the same face
        if (i > 0) {
            while (randomMove[0] === scramble[i-1][0]) {
                randomMove = moves[Math.floor(Math.random() * moves.length)];
            }
        }
        
        scramble.push(randomMove);
    }
    
    currentScramble = scramble.join(' ');
    scrambleDisplay.textContent = currentScramble;
}

// Times list
function updateTimesList() {
    timesListElement.innerHTML = '';
    
    // Sort times from fastest to slowest for display
    const sortedTimes = [...timesList].sort((a, b) => a.time - b.time);
    
    sortedTimes.forEach((timeObj, index) => {
        const time = formatTime(timeObj.time);
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${time}`;
        timesListElement.appendChild(li);
    });
}

function formatTime(time) {
    let hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((time % (1000 * 60)) / 1000);
    let milliseconds = Math.floor((time % 1000) / 10);
    
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    milliseconds = (milliseconds < 10) ? "0" + milliseconds : milliseconds;
    
    if (hours === "00") {
        if (minutes === "00") {
            return seconds + '.' + milliseconds;
        }
        return minutes + ':' + seconds + '.' + milliseconds;
    }
    return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
}

// Keyboard controls
function handleKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        
        if (e.type === 'keydown') {
            if (!spacePressed) {
                spacePressed = true;
                
                if (running) {
                    stopTimer();
                } else {
                    if (savedTime > 0) {
                        // Second press - reset timer but keep data
                        resetTimer();
                    } else {
                        // First press - start timer
                        startTimer();
                    }
                }
            }
        }
    }
}

// Touch screen controls
function handleTap() {
    if (isMobile) {
        if (running) {
            stopTimer();
        } else {
            if (savedTime > 0) {
                // Second tap - reset timer but keep data
                resetTimer();
            } else {
                // First tap - start timer
                startTimer();
            }
        }
    }
}

// Reset space pressed flag when key is released
document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        spacePressed = false;
    }
});

// Prevent zooming on double-tap (common mobile issue)
document.addEventListener('dblclick', (e) => {
    if (isMobile) {
        e.preventDefault();
    }
});