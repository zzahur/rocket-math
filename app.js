// Your live Google Apps Script Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbypSSkYKvEDBSbIZfzMILzgZMYie7_atMgwTjEu4LsCTjvd8M1IJafwoM6frFh4VcU/exec";

// Avatar Customization Config
const AVATAR_OPTIONS = [
    { name: "Blue Star", color: "#3182ce", icon: "⭐" },
    { name: "Green Dino", color: "#38a169", icon: "🦖" },
    { name: "Purple Cat", color: "#6b11ff", icon: "🐱" },
    { name: "Red Rocket", color: "#ff5e00", icon: "🚀" },
    { name: "Yellow Smile", color: "#f6e05e", icon: "😊" },
    { name: "Teal Robot", color: "#38b2ac", icon: "🤖" },
    { name: "Brown Bear", color: "#a52a2a", icon: "🐻" },
    { name: "Orange Zap", color: "#e07a1c", icon: "⚡" },
    { name: "Pink Flower", color: "#d53f8c", icon: "🌸" },
    { name: "Aqua Fish", color: "#00d4ff", icon: "🐠" }
];

// Global Game State Variables
let selectedOperation = null;
let currentScore = 0;
let currentLevel = 1;
let questionCount = 0;
let correctAnswer = 0;
let timerInterval = null;
let timeLeft = 10;
let avatarIndex = 0;
let playerName = "Anonymous Explorer";
let currentLeaderboardOp = "addition"; // Default filter tab

// DOM Elements
const screens = {
    profile: document.getElementById("profile-screen"),
    menu: document.getElementById("menu-screen"),
    game: document.getElementById("game-screen"),
    gameover: document.getElementById("gameover-screen"),
    leaderboard: document.getElementById("leaderboard-screen")
};

function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[screenName].classList.add("active");
}

// Character Creation: Update Preview
function updateAvatarPreview() {
    const avatar = AVATAR_OPTIONS[avatarIndex];
    const previewEl = document.getElementById("avatar-preview");
    
    previewEl.style.backgroundColor = avatar.color;
    previewEl.style.borderColor = avatar.color;
    previewEl.style.display = 'flex';
    previewEl.style.justifyContent = 'center';
    previewEl.style.alignItems = 'center';
    previewEl.style.fontSize = '80px';
    previewEl.innerText = avatar.icon;
}

updateAvatarPreview();

// Avatar Controls
document.getElementById("prev-btn").addEventListener("click", () => {
    avatarIndex = (avatarIndex - 1 + AVATAR_OPTIONS.length) % AVATAR_OPTIONS.length;
    updateAvatarPreview();
});

document.getElementById("next-btn").addEventListener("click", () => {
    avatarIndex = (avatarIndex + 1) % AVATAR_OPTIONS.length;
    updateAvatarPreview();
});

// Name Input Validation
const nameInputEl = document.getElementById("player-name-input");
nameInputEl.addEventListener("input", (e) => {
    const isNameValid = e.target.value.trim().length > 0;
    document.getElementById("create-profile-btn").disabled = !isNameValid;
});

// Profile Done Button
document.getElementById("create-profile-btn").addEventListener("click", () => {
    playerName = nameInputEl.value.trim() || "Anonymous Explorer";
    const avatar = AVATAR_OPTIONS[avatarIndex];
    
    const hdrAvatarEl = document.getElementById("header-avatar");
    hdrAvatarEl.style.backgroundColor = avatar.color;
    hdrAvatarEl.style.borderColor = avatar.color;
    hdrAvatarEl.style.display = 'flex';
    hdrAvatarEl.style.justifyContent = 'center';
    hdrAvatarEl.style.alignItems = 'center';
    hdrAvatarEl.style.fontSize = '18px';
    hdrAvatarEl.innerText = avatar.icon;
    
    switchScreen("menu");
});

// Operation Selection
document.querySelectorAll(".op-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".op-btn").forEach(b => b.classList.remove("selected"));
        e.target.classList.add("selected");
        selectedOperation = e.target.getAttribute("data-op");
        document.getElementById("start-btn").disabled = false;
    });
});

// Start Game
document.getElementById("start-btn").addEventListener("click", () => {
    currentScore = 0;
    currentLevel = 1;
    questionCount = 0;
    document.getElementById("score-display").innerText = `Score: ${currentScore}`;
    switchScreen("game");
    nextQuestion();
});

// Question Generator Engine
function nextQuestion() {
    questionCount++;
    if (questionCount > 10) {
        endGame();
        return;
    }

    timeLeft = 10;
    document.getElementById("timer-display").innerText = `⏱️ ${timeLeft}s`;
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer-display").innerText = `⏱️ ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            nextQuestion(); 
        }
    }, 1000);

    let num1, num2, qText;
    let isAlgebra = (questionCount === 10);

    if (selectedOperation === "addition") {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        correctAnswer = num1 + num2;
        qText = isAlgebra ? `${num1} + ? = ${correctAnswer}` : `${num1} + ${num2} = ?`;
    } else if (selectedOperation === "subtraction") {
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * num1); 
        correctAnswer = num1 - num2;
        qText = isAlgebra ? `${num1} - ? = ${correctAnswer}` : `${num1} - ${num2} = ?`;
    } else if (selectedOperation === "multiplication") {
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        correctAnswer = num1 * num2;
        qText = isAlgebra ? `${num1} × ? = ${correctAnswer}` : `${num1} × ${num2} = ?`;
    } else if (selectedOperation === "division") {
        num2 = Math.floor(Math.random() * 10) + 1;
        let multiplier = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * multiplier; 
        correctAnswer = multiplier;
        qText = isAlgebra ? `? × ${num2} = ${num1}` : `${num1} ÷ ${num2} = ?`;
    }

    document.getElementById("question-text").innerText = qText;
    document.getElementById("answer-input").value = "";
    document.getElementById("answer-input").focus();
}

// Confetti Effects
function burstConfetti() {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
}

function celebrationShower() {
    confetti({ particleCount: 150, angle: 60, spread: 70, origin: { x: 0, y: 0.8 } });
    confetti({ particleCount: 150, angle: 120, spread: 70, origin: { x: 1, y: 0.8 } });
}

// Answer Submission
function submitAnswer() {
    const userAns = Number(document.getElementById("answer-input").value);
    
    if (document.getElementById("answer-input").value === "") return;

    if (userAns === correctAnswer) {
        clearInterval(timerInterval);
        burstConfetti(); 
        
        let pointsEarned = 10 + (timeLeft * 2);
        currentScore += pointsEarned;
        document.getElementById("score-display").innerText = `Score: ${currentScore}`;
    }
    nextQuestion();
}

document.getElementById("submit-answer-btn").addEventListener("click", submitAnswer);
document.getElementById("answer-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") submitAnswer();
});

// End Game
function endGame() {
    clearInterval(timerInterval);
    switchScreen("gameover");
    document.getElementById("final-score-display").innerText = currentScore;
    
    const avatar = AVATAR_OPTIONS[avatarIndex];
    const endAvatarEl = document.getElementById("end-screen-avatar");
    endAvatarEl.style.backgroundColor = avatar.color;
    endAvatarEl.style.borderColor = avatar.color;
    endAvatarEl.style.display = 'flex';
    endAvatarEl.style.justifyContent = 'center';
    endAvatarEl.style.alignItems = 'center';
    endAvatarEl.style.fontSize = '45px';
    endAvatarEl.innerText = avatar.icon;
}

// Google Sheets Score Submission
document.getElementById("goto-leaderboard-btn").addEventListener("click", async () => {
    const btn = document.getElementById("goto-leaderboard-btn");
    btn.innerText = "Saving...";
    btn.disabled = true;

    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                name: playerName,
                score: currentScore,
                operation: selectedOperation,
                level: avatarIndex 
            })
        });
        
        currentLeaderboardOp = selectedOperation; // Match leaderboard to what they just played
        updateFilterButtonUI(currentLeaderboardOp);
        
        await loadLeaderboard(currentLeaderboardOp);
        switchScreen("leaderboard");
        celebrationShower(); 
    } catch (error) {
        console.error("Error saving score:", error);
        alert("Could not save score, but great job playing!");
    } finally {
        btn.innerText = "Save to Leaderboard 🌟";
        btn.disabled = false;
    }
});

// Fetch and Display Filtered Leaderboard
async function loadLeaderboard(operation) {
    const listEl = document.getElementById("leaderboard-list");
    listEl.innerHTML = "<li>Loading top scores...</li>";
    
    try {
        const response = await fetch(`${WEB_APP_URL}?operation=${operation}`);
        const data = await response.json();
        
        listEl.innerHTML = "";
        if (data.length === 0) {
            listEl.innerHTML = "<li>No scores for this mode yet. Be the first!</li>";
            return;
        }

        data.forEach((entry, idx) => {
            let avtIdx = entry.level; 
            if (avtIdx === undefined || isNaN(avtIdx)) avtIdx = 0; 
            
            const avatar = AVATAR_OPTIONS[parseInt(avtIdx)];

            const li = document.createElement("li");
            li.innerHTML = `
                <div class="leaderboard-profile">
                    <span>#${idx + 1}</span>
                    <div class="ldr-avatar" style="background-color:${avatar.color}; border-color:${avatar.color}; display:flex; justify-content:center; align-items:center; font-size:16px;">
                        ${avatar.icon}
                    </div>
                    <span>${entry.name}</span>
                </div>
                <span>${entry.score} pts</span>`;
            listEl.appendChild(li);
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        listEl.innerHTML = "<li>Failed to load leaderboard.</li>";
    }
}

// Update Active Button UI Styling
function updateFilterButtonUI(op) {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        if (btn.getAttribute("data-op") === op) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// Filter Button Click Listeners
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
        const op = e.target.getAttribute("data-op");
        currentLeaderboardOp = op;
        updateFilterButtonUI(op);
        await loadLeaderboard(op);
    });
});

// Navigation Events
document.getElementById("view-leaderboard-btn").addEventListener("click", async () => {
    switchScreen("leaderboard");
    updateFilterButtonUI(currentLeaderboardOp);
    await loadLeaderboard(currentLeaderboardOp);
    celebrationShower(); 
});

document.getElementById("back-to-menu-btn").addEventListener("click", () => {
    switchScreen("menu");
});

document.getElementById("restart-btn").addEventListener("click", () => {
    switchScreen("menu");
});// Your live Google Apps Script Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbypSSkYKvEDBSbIZfzMILzgZMYie7_atMgwTjEu4LsCTjvd8M1IJafwoM6frFh4VcU/exec";

// Avatar Customization Config (Mii-style simple)
const AVATAR_OPTIONS = [
    { name: "Blue Star", color: "#3182ce", icon: "⭐" },
    { name: "Green Dino", color: "#38a169", icon: "🦖" },
    { name: "Purple Cat", color: "#6b11ff", icon: "🐱" },
    { name: "Red Rocket", color: "#ff5e00", icon: "🚀" },
    { name: "Yellow Smile", color: "#f6e05e", icon: "😊" },
    { name: "Teal Robot", color: "#38b2ac", icon: "🤖" },
    { name: "Brown Bear", color: "#a52a2a", icon: "🐻" },
    { name: "Orange Zap", color: "#e07a1c", icon: "⚡" },
    { name: "Pink Flower", color: "#d53f8c", icon: "🌸" },
    { name: "Aqua Fish", color: "#00d4ff", icon: "🐠" }
];

// Global Game State Variables
let selectedOperation = null;
let currentScore = 0;
let currentLevel = 1;
let questionCount = 0;
let correctAnswer = 0;
let timerInterval = null;
let timeLeft = 10;
let avatarIndex = 0;
let playerName = "Anonymous Explorer";

// DOM Elements
const screens = {
    profile: document.getElementById("profile-screen"),
    menu: document.getElementById("menu-screen"),
    game: document.getElementById("game-screen"),
    gameover: document.getElementById("gameover-screen"),
    leaderboard: document.getElementById("leaderboard-screen")
};

function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[screenName].classList.add("active");
}

// Character Creation: Update Preview
function updateAvatarPreview() {
    const avatar = AVATAR_OPTIONS[avatarIndex];
    const previewEl = document.getElementById("avatar-preview");
    
    previewEl.style.backgroundColor = avatar.color;
    previewEl.style.borderColor = avatar.color;
    previewEl.style.display = 'flex';
    previewEl.style.justifyContent = 'center';
    previewEl.style.alignItems = 'center';
    previewEl.style.fontSize = '80px';
    previewEl.innerText = avatar.icon;
}

updateAvatarPreview();

// Avatar Controls
document.getElementById("prev-btn").addEventListener("click", () => {
    avatarIndex = (avatarIndex - 1 + AVATAR_OPTIONS.length) % AVATAR_OPTIONS.length;
    updateAvatarPreview();
});

document.getElementById("next-btn").addEventListener("click", () => {
    avatarIndex = (avatarIndex + 1) % AVATAR_OPTIONS.length;
    updateAvatarPreview();
});

// Name Input Validation
const nameInputEl = document.getElementById("player-name-input");
nameInputEl.addEventListener("input", (e) => {
    const isNameValid = e.target.value.trim().length > 0;
    document.getElementById("create-profile-btn").disabled = !isNameValid;
});

// Profile Done Button
document.getElementById("create-profile-btn").addEventListener("click", () => {
    playerName = nameInputEl.value.trim() || "Anonymous Explorer";
    const avatar = AVATAR_OPTIONS[avatarIndex];
    
    const hdrAvatarEl = document.getElementById("header-avatar");
    hdrAvatarEl.style.backgroundColor = avatar.color;
    hdrAvatarEl.style.borderColor = avatar.color;
    hdrAvatarEl.style.display = 'flex';
    hdrAvatarEl.style.justifyContent = 'center';
    hdrAvatarEl.style.alignItems = 'center';
    hdrAvatarEl.style.fontSize = '18px';
    hdrAvatarEl.innerText = avatar.icon;
    
    switchScreen("menu");
});

// Operation Selection
document.querySelectorAll(".op-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".op-btn").forEach(b => b.classList.remove("selected"));
        e.target.classList.add("selected");
        selectedOperation = e.target.getAttribute("data-op");
        document.getElementById("start-btn").disabled = false;
    });
});

// Start Game
document.getElementById("start-btn").addEventListener("click", () => {
    currentScore = 0;
    currentLevel = 1;
    questionCount = 0;
    document.getElementById("score-display").innerText = `Score: ${currentScore}`;
    switchScreen("game");
    nextQuestion();
});

// Question Generator Engine
function nextQuestion() {
    questionCount++;
    if (questionCount > 10) {
        endGame();
        return;
    }

    timeLeft = 10;
    document.getElementById("timer-display").innerText = `⏱️ ${timeLeft}s`;
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer-display").innerText = `⏱️ ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            nextQuestion(); 
        }
    }, 1000);

    let num1, num2, qText;
    let isAlgebra = (questionCount === 10); // Final question is the algebra "backwards" challenge!

    if (selectedOperation === "addition") {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        correctAnswer = num1 + num2;
        qText = isAlgebra ? `${num1} + ? = ${correctAnswer}` : `${num1} + ${num2} = ?`;
    } else if (selectedOperation === "subtraction") {
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * num1); 
        correctAnswer = num1 - num2;
        qText = isAlgebra ? `${num1} - ? = ${correctAnswer}` : `${num1} - ${num2} = ?`;
    } else if (selectedOperation === "multiplication") {
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        correctAnswer = num1 * num2;
        qText = isAlgebra ? `${num1} × ? = ${correctAnswer}` : `${num1} × ${num2} = ?`;
    } else if (selectedOperation === "division") {
        num2 = Math.floor(Math.random() * 10) + 1;
        let multiplier = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * multiplier; 
        correctAnswer = multiplier;
        qText = isAlgebra ? `? × ${num2} = ${num1}` : `${num1} ÷ ${num2} = ?`;
    }

    document.getElementById("question-text").innerText = qText;
    document.getElementById("answer-input").value = "";
    document.getElementById("answer-input").focus();
}

// Confetti Effects
function burstConfetti() {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
}

function celebrationShower() {
    confetti({ particleCount: 150, angle: 60, spread: 70, origin: { x: 0, y: 0.8 } });
    confetti({ particleCount: 150, angle: 120, spread: 70, origin: { x: 1, y: 0.8 } });
}

// Answer Submission
function submitAnswer() {
    const userAns = Number(document.getElementById("answer-input").value);
    
    if (document.getElementById("answer-input").value === "") return;

    if (userAns === correctAnswer) {
        clearInterval(timerInterval);
        burstConfetti(); 
        
        let pointsEarned = 10 + (timeLeft * 2);
        currentScore += pointsEarned;
        document.getElementById("score-display").innerText = `Score: ${currentScore}`;
    }
    nextQuestion();
}

document.getElementById("submit-answer-btn").addEventListener("click", submitAnswer);
document.getElementById("answer-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") submitAnswer();
});

// End Game
function endGame() {
    clearInterval(timerInterval);
    switchScreen("gameover");
    document.getElementById("final-score-display").innerText = currentScore;
    
    const avatar = AVATAR_OPTIONS[avatarIndex];
    const endAvatarEl = document.getElementById("end-screen-avatar");
    endAvatarEl.style.backgroundColor = avatar.color;
    endAvatarEl.style.borderColor = avatar.color;
    endAvatarEl.style.display = 'flex';
    endAvatarEl.style.justifyContent = 'center';
    endAvatarEl.style.alignItems = 'center';
    endAvatarEl.style.fontSize = '45px';
    endAvatarEl.innerText = avatar.icon;
}

// Google Sheets Score Submission
document.getElementById("goto-leaderboard-btn").addEventListener("click", async () => {
    const btn = document.getElementById("goto-leaderboard-btn");
    btn.innerText = "Saving...";
    btn.disabled = true;

    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                name: playerName,
                score: currentScore,
                operation: selectedOperation,
                level: avatarIndex 
            })
        });
        await loadLeaderboard();
        switchScreen("leaderboard");
        celebrationShower(); 
    } catch (error) {
        console.error("Error saving score:", error);
        alert("Could not save score, but great job playing!");
    } finally {
        btn.innerText = "Save to Leaderboard 🌟";
        btn.disabled = false;
    }
});

// Fetch and Display Leaderboard
async function loadLeaderboard() {
    const listEl = document.getElementById("leaderboard-list");
    listEl.innerHTML = "<li>Loading top scores...</li>";
    
    try {
        const response = await fetch(WEB_APP_URL);
        const data = await response.json();
        
        listEl.innerHTML = "";
        if (data.length === 0) {
            listEl.innerHTML = "<li>No scores yet. Be the first!</li>";
            return;
        }

        data.forEach((entry, idx) => {
            let avtIdx = entry.level; 
            if (avtIdx === undefined || isNaN(avtIdx)) avtIdx = 0; 
            
            const avatar = AVATAR_OPTIONS[parseInt(avtIdx)];

            const li = document.createElement("li");
            li.innerHTML = `
                <div class="leaderboard-profile">
                    <span>#${idx + 1}</span>
                    <div class="ldr-avatar" style="background-color:${avatar.color}; border-color:${avatar.color}; display:flex; justify-content:center; align-items:center; font-size:16px;">
                        ${avatar.icon}
                    </div>
                    <span>${entry.name} (${entry.operation})</span>
                </div>
                <span>${entry.score} pts</span>`;
            listEl.appendChild(li);
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        listEl.innerHTML = "<li>Failed to load leaderboard.</li>";
    }
}

// Navigation Events
document.getElementById("view-leaderboard-btn").addEventListener("click", async () => {
    switchScreen("leaderboard");
    await loadLeaderboard();
    celebrationShower(); 
});

document.getElementById("back-to-menu-btn").addEventListener("click", () => {
    switchScreen("menu");
});

document.getElementById("restart-btn").addEventListener("click", () => {
    switchScreen("menu");
});
