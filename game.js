// Game State
let gameState = {
    currentScreen: 'home-screen',
    homeTeam: null,
    awayTeam: null,
    homeScore: 0,
    awayScore: 0,
    minute: 0,
    matchRunning: false,
    matchSpeed: 500,
    events: [],
    stats: {
        homeShots: 0,
        awayShots: 0,
        homeShotsOnTarget: 0,
        awayShotsOnTarget: 0,
        homePossession: 50,
        awayPossession: 50,
        homeFouls: 0,
        awayFouls: 0
    },
    season: null,
    globalStats: {
        matchesPlayed: 0,
        totalGoals: 0,
        wins: 0,
        draws: 0
    }
};

// Teams Database
const teams = [
    {
        name: 'Manchester United',
        attack: 85,
        defense: 82,
        midfield: 83,
        overall: 83,
        players: ['Rashford', 'Fernandes', 'Casemiro', 'Martinez']
    },
    {
        name: 'Liverpool',
        attack: 88,
        defense: 84,
        midfield: 86,
        overall: 86,
        players: ['Salah', 'Nunez', 'Van Dijk', 'Alexander-Arnold']
    },
    {
        name: 'Chelsea',
        attack: 82,
        defense: 83,
        midfield: 81,
        overall: 82,
        players: ['Sterling', 'Jackson', 'Enzo', 'James']
    },
    {
        name: 'Arsenal',
        attack: 86,
        defense: 85,
        midfield: 84,
        overall: 85,
        players: ['Saka', 'Jesus', 'Odegaard', 'Saliba']
    },
    {
        name: 'Manchester City',
        attack: 90,
        defense: 87,
        midfield: 89,
        overall: 89,
        players: ['Haaland', 'De Bruyne', 'Rodri', 'Dias']
    },
    {
        name: 'Tottenham',
        attack: 84,
        defense: 80,
        midfield: 82,
        overall: 82,
        players: ['Son', 'Kane', 'Maddison', 'Romero']
    },
    {
        name: 'Barcelona',
        attack: 87,
        defense: 83,
        midfield: 85,
        overall: 85,
        players: ['Lewandowski', 'Gavi', 'Pedri', 'Araujo']
    },
    {
        name: 'Real Madrid',
        attack: 89,
        defense: 86,
        midfield: 88,
        overall: 88,
        players: ['Vinicius', 'Bellingham', 'Modric', 'Rudiger']
    }
];

// Load saved stats from localStorage
function loadStats() {
    const saved = localStorage.getItem('footballSimStats');
    if (saved) {
        gameState.globalStats = JSON.parse(saved);
        updateStatsDisplay();
    }
}

// Save stats to localStorage
function saveStats() {
    localStorage.setItem('footballSimStats', JSON.stringify(gameState.globalStats));
}

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
    
    // Update team info when showing team selection
    if (screenId === 'team-select-screen') {
        updateTeamInfo('home');
        updateTeamInfo('away');
    }
    
    // Update stats when showing stats screen
    if (screenId === 'stats-screen') {
        updateStatsDisplay();
    }
    
    // Initialize season when showing season screen
    if (screenId === 'season-screen' && !gameState.season) {
        initSeason();
    }
}

// Update team info display
function updateTeamInfo(side) {
    const select = document.getElementById(`${side}-team`);
    const teamIndex = parseInt(select.value);
    const team = teams[teamIndex];
    const infoDiv = document.getElementById(`${side}-team-info`);
    
    infoDiv.innerHTML = `
        <strong>Overall: ${team.overall}</strong><br>
        <span>⚔️ Attack: ${team.attack}</span><br>
        <span>🛡️ Defense: ${team.defense}</span><br>
        <span>⚽ Midfield: ${team.midfield}</span><br>
        <strong>Key Players:</strong> ${team.players.join(', ')}
    `;
}

// Add event listeners for team selection
document.getElementById('home-team').addEventListener('change', () => updateTeamInfo('home'));
document.getElementById('away-team').addEventListener('change', () => updateTeamInfo('away'));

// Start Match
function startMatch() {
    const homeIndex = parseInt(document.getElementById('home-team').value);
    const awayIndex = parseInt(document.getElementById('away-team').value);
    
    if (homeIndex === awayIndex) {
        alert('Please select different teams!');
        return;
    }
    
    gameState.homeTeam = teams[homeIndex];
    gameState.awayTeam = teams[awayIndex];
    gameState.homeScore = 0;
    gameState.awayScore = 0;
    gameState.minute = 0;
    gameState.matchRunning = false;
    gameState.events = [];
    gameState.stats = {
        homeShots: 0,
        awayShots: 0,
        homeShotsOnTarget: 0,
        awayShotsOnTarget: 0,
        homePossession: 50,
        awayPossession: 50,
        homeFouls: 0,
        awayFouls: 0
    };
    
    // Update match screen
    document.getElementById('match-home-name').textContent = gameState.homeTeam.name;
    document.getElementById('match-away-name').textContent = gameState.awayTeam.name;
    document.getElementById('home-score').textContent = '0';
    document.getElementById('away-score').textContent = '0';
    document.getElementById('match-minute').textContent = "0'";
    document.getElementById('match-period').textContent = '1st Half';
    document.getElementById('match-events').innerHTML = '<div class="event-item"><span class="event-time">0\'</span><span class="event-text">⚽ Match Started!</span></div>';
    
    showScreen('match-screen');
}

// Toggle Match Play/Pause
function toggleMatch() {
    gameState.matchRunning = !gameState.matchRunning;
    const btn = document.getElementById('play-pause-btn');
    
    if (gameState.matchRunning) {
        btn.innerHTML = '<span id="play-pause-icon">⏸️</span> Pause';
        runMatch();
    } else {
        btn.innerHTML = '<span id="play-pause-icon">▶️</span> Play';
    }
}

// Speed Up Match
function speedUpMatch() {
    const speedSelect = document.getElementById('match-speed');
    const currentSpeed = parseInt(speedSelect.value);
    
    if (currentSpeed > 100) {
        const speeds = [1000, 500, 250, 100];
        const currentIndex = speeds.indexOf(currentSpeed);
        if (currentIndex < speeds.length - 1) {
            gameState.matchSpeed = speeds[currentIndex + 1];
            speedSelect.value = gameState.matchSpeed;
        }
    }
}

// Run Match Simulation
function runMatch() {
    if (!gameState.matchRunning || gameState.minute >= 90) {
        return;
    }
    
    const speedSelect = document.getElementById('match-speed');
    gameState.matchSpeed = parseInt(speedSelect.value);
    
    gameState.minute++;
    updateMatchDisplay();
    
    // Simulate match events
    simulateMatchEvents();
    
    // Check for half-time
    if (gameState.minute === 45) {
        addEvent(45, '⏱️ Half Time!');
        document.getElementById('match-period').textContent = 'Half Time';
        setTimeout(() => {
            if (gameState.matchRunning) {
                document.getElementById('match-period').textContent = '2nd Half';
                setTimeout(() => runMatch(), gameState.matchSpeed);
            }
        }, 2000);
    } else if (gameState.minute === 90) {
        // Match ended
        addEvent(90, '🏁 Full Time!');
        document.getElementById('match-period').textContent = 'Full Time';
        gameState.matchRunning = false;
        document.getElementById('play-pause-btn').innerHTML = '<span id="play-pause-icon">▶️</span> Play';
        
        // Update global stats
        gameState.globalStats.matchesPlayed++;
        gameState.globalStats.totalGoals += gameState.homeScore + gameState.awayScore;
        if (gameState.homeScore > gameState.awayScore || gameState.awayScore > gameState.homeScore) {
            gameState.globalStats.wins++;
        } else {
            gameState.globalStats.draws++;
        }
        saveStats();
        
        setTimeout(() => showResultScreen(), 2000);
    } else {
        setTimeout(() => runMatch(), gameState.matchSpeed);
    }
}

// Simulate Match Events
function simulateMatchEvents() {
    const homeAttackStrength = gameState.homeTeam.attack + gameState.homeTeam.midfield;
    const awayAttackStrength = gameState.awayTeam.attack + gameState.awayTeam.midfield;
    const totalStrength = homeAttackStrength + awayAttackStrength;
    
    // Update possession
    gameState.stats.homePossession = Math.round((homeAttackStrength / totalStrength) * 100);
    gameState.stats.awayPossession = 100 - gameState.stats.homePossession;
    
    // Random events based on team strength
    const rand = Math.random() * 100;
    
    if (rand < 5) {
        // Potential goal attempt
        const homeChance = (homeAttackStrength / totalStrength) * 100;
        const isHomeAttack = Math.random() * 100 < homeChance;
        
        if (isHomeAttack) {
            gameState.stats.homeShots++;
            const shotQuality = Math.random() * 100;
            
            if (shotQuality < gameState.homeTeam.attack / 2) {
                // Goal!
                gameState.homeScore++;
                const scorer = gameState.homeTeam.players[Math.floor(Math.random() * gameState.homeTeam.players.length)];
                addEvent(gameState.minute, `⚽ GOAL! ${scorer} scores for ${gameState.homeTeam.name}!`);
                updateScores();
                gameState.stats.homeShotsOnTarget++;
                moveBall(20, 50);
            } else if (shotQuality < gameState.homeTeam.attack) {
                gameState.stats.homeShotsOnTarget++;
                addEvent(gameState.minute, `🧤 Great save! ${gameState.homeTeam.name} shot saved!`);
                moveBall(80, 30);
            } else {
                addEvent(gameState.minute, `📊 ${gameState.homeTeam.name} shot goes wide!`);
                moveBall(90, Math.random() * 60 + 20);
            }
        } else {
            gameState.stats.awayShots++;
            const shotQuality = Math.random() * 100;
            
            if (shotQuality < gameState.awayTeam.attack / 2) {
                // Goal!
                gameState.awayScore++;
                const scorer = gameState.awayTeam.players[Math.floor(Math.random() * gameState.awayTeam.players.length)];
                addEvent(gameState.minute, `⚽ GOAL! ${scorer} scores for ${gameState.awayTeam.name}!`);
                updateScores();
                gameState.stats.awayShotsOnTarget++;
                moveBall(80, 50);
            } else if (shotQuality < gameState.awayTeam.attack) {
                gameState.stats.awayShotsOnTarget++;
                addEvent(gameState.minute, `🧤 Great save! ${gameState.awayTeam.name} shot saved!`);
                moveBall(20, 70);
            } else {
                addEvent(gameState.minute, `📊 ${gameState.awayTeam.name} shot goes wide!`);
                moveBall(10, Math.random() * 60 + 20);
            }
        }
    } else if (rand < 7) {
        // Foul
        const isHomeFoul = Math.random() > 0.5;
        if (isHomeFoul) {
            gameState.stats.homeFouls++;
            addEvent(gameState.minute, `🟨 Foul by ${gameState.homeTeam.name}`);
        } else {
            gameState.stats.awayFouls++;
            addEvent(gameState.minute, `🟨 Foul by ${gameState.awayTeam.name}`);
        }
    } else if (rand < 8) {
        // Corner or free kick
        const team = Math.random() > 0.5 ? gameState.homeTeam.name : gameState.awayTeam.name;
        addEvent(gameState.minute, `⚑ Corner kick for ${team}`);
    }
    
    // Random ball movement
    if (Math.random() < 0.1) {
        moveBall(Math.random() * 80 + 10, Math.random() * 80 + 10);
    }
}

// Move ball animation
function moveBall(xPercent, yPercent) {
    const ball = document.getElementById('ball');
    ball.style.left = xPercent + '%';
    ball.style.top = yPercent + '%';
}

// Update match display
function updateMatchDisplay() {
    document.getElementById('match-minute').textContent = gameState.minute + "'";
}

// Update scores
function updateScores() {
    document.getElementById('home-score').textContent = gameState.homeScore;
    document.getElementById('away-score').textContent = gameState.awayScore;
}

// Add event to match events
function addEvent(minute, text) {
    const eventsContainer = document.getElementById('match-events');
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-item';
    eventDiv.innerHTML = `<span class="event-time">${minute}'</span><span class="event-text">${text}</span>`;
    eventsContainer.insertBefore(eventDiv, eventsContainer.firstChild);
    
    // Keep only last 10 events
    while (eventsContainer.children.length > 10) {
        eventsContainer.removeChild(eventsContainer.lastChild);
    }
}

// Show match stats
function showMatchStats() {
    alert(`Match Statistics:
    
Possession:
${gameState.homeTeam.name}: ${gameState.stats.homePossession}%
${gameState.awayTeam.name}: ${gameState.stats.awayPossession}%

Shots:
${gameState.homeTeam.name}: ${gameState.stats.homeShots}
${gameState.awayTeam.name}: ${gameState.stats.awayShots}

Shots on Target:
${gameState.homeTeam.name}: ${gameState.stats.homeShotsOnTarget}
${gameState.awayTeam.name}: ${gameState.stats.awayShotsOnTarget}

Fouls:
${gameState.homeTeam.name}: ${gameState.stats.homeFouls}
${gameState.awayTeam.name}: ${gameState.stats.awayFouls}`);
}

// Show Result Screen
function showResultScreen() {
    document.getElementById('result-home-name').textContent = gameState.homeTeam.name;
    document.getElementById('result-away-name').textContent = gameState.awayTeam.name;
    document.getElementById('result-home-score').textContent = gameState.homeScore;
    document.getElementById('result-away-score').textContent = gameState.awayScore;
    
    // Determine verdict
    let verdict = '';
    if (gameState.homeScore > gameState.awayScore) {
        verdict = `🏆 ${gameState.homeTeam.name} Wins!`;
    } else if (gameState.awayScore > gameState.homeScore) {
        verdict = `🏆 ${gameState.awayTeam.name} Wins!`;
    } else {
        verdict = '🤝 Draw!';
    }
    document.getElementById('result-verdict').textContent = verdict;
    
    // Update statistics
    document.getElementById('stat-home-possession').textContent = gameState.stats.homePossession + '%';
    document.getElementById('stat-away-possession').textContent = gameState.stats.awayPossession + '%';
    document.getElementById('stat-home-shots').textContent = gameState.stats.homeShots;
    document.getElementById('stat-away-shots').textContent = gameState.stats.awayShots;
    document.getElementById('stat-home-shots-on-target').textContent = gameState.stats.homeShotsOnTarget;
    document.getElementById('stat-away-shots-on-target').textContent = gameState.stats.awayShotsOnTarget;
    document.getElementById('stat-home-fouls').textContent = gameState.stats.homeFouls;
    document.getElementById('stat-away-fouls').textContent = gameState.stats.awayFouls;
    
    showScreen('result-screen');
}

// Season Mode Functions
function initSeason() {
    gameState.season = {
        teams: teams.map(team => ({
            name: team.name,
            team: team,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            points: 0
        })),
        currentMatchday: 0
    };
    updateLeagueTable();
}

function updateLeagueTable() {
    const tbody = document.getElementById('league-table-body');
    tbody.innerHTML = '';
    
    // Sort teams by points
    const sortedTeams = [...gameState.season.teams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.won - a.won;
    });
    
    sortedTeams.forEach((team, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="team-name">${team.name}</td>
            <td>${team.played}</td>
            <td>${team.won}</td>
            <td>${team.drawn}</td>
            <td>${team.lost}</td>
            <td><strong>${team.points}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

function simulateNextMatch() {
    if (!gameState.season) {
        initSeason();
        return;
    }
    
    // Get two random teams
    const team1Index = Math.floor(Math.random() * gameState.season.teams.length);
    let team2Index = Math.floor(Math.random() * gameState.season.teams.length);
    while (team2Index === team1Index) {
        team2Index = Math.floor(Math.random() * gameState.season.teams.length);
    }
    
    const team1 = gameState.season.teams[team1Index];
    const team2 = gameState.season.teams[team2Index];
    
    // Simulate match
    const score1 = Math.floor(Math.random() * 4);
    const score2 = Math.floor(Math.random() * 4);
    
    // Update stats
    team1.played++;
    team2.played++;
    
    if (score1 > score2) {
        team1.won++;
        team1.points += 3;
        team2.lost++;
    } else if (score2 > score1) {
        team2.won++;
        team2.points += 3;
        team1.lost++;
    } else {
        team1.drawn++;
        team2.drawn++;
        team1.points++;
        team2.points++;
    }
    
    updateLeagueTable();
    alert(`Match Result:\n${team1.name} ${score1} - ${score2} ${team2.name}`);
}

// Update Statistics Display
function updateStatsDisplay() {
    document.getElementById('total-matches').textContent = gameState.globalStats.matchesPlayed;
    document.getElementById('total-goals').textContent = gameState.globalStats.totalGoals;
    document.getElementById('total-wins').textContent = gameState.globalStats.wins;
    document.getElementById('total-draws').textContent = gameState.globalStats.draws;
}

// Reset Statistics
function resetStats() {
    if (confirm('Are you sure you want to reset all statistics?')) {
        gameState.globalStats = {
            matchesPlayed: 0,
            totalGoals: 0,
            wins: 0,
            draws: 0
        };
        saveStats();
        updateStatsDisplay();
        alert('Statistics reset successfully!');
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    loadStats();
    updateTeamInfo('home');
    updateTeamInfo('away');
});
