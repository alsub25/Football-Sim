// Enhanced Game Simulation with Play-by-Play

// Game phases
const GAME_PHASES = ['Q1', 'Q2', 'Q3', 'Q4', 'OT'];

// Play types
const PLAY_TYPES = {
  RUN: 'Run',
  SHORT_PASS: 'Short Pass',
  MEDIUM_PASS: 'Medium Pass',
  LONG_PASS: 'Long Pass',
  SCREEN: 'Screen',
  SACK: 'Sack',
  INTERCEPTION: 'Interception',
  FUMBLE: 'Fumble',
  PUNT: 'Punt',
  FIELD_GOAL: 'Field Goal',
  TOUCHDOWN: 'Touchdown',
  EXTRA_POINT: 'Extra Point',
  TWO_POINT: '2-Point Conversion',
};

// Simulate a game with play-by-play
export function simulateGameDetailed(game, rosters, coaches = {}) {
  const homeRoster = rosters[game.homeTeam] || [];
  const awayRoster = rosters[game.awayTeam] || [];
  const homeCoach = coaches[game.homeTeam];
  const awayCoach = coaches[game.awayTeam];
  
  const homeStrength = calculateTeamStrength(homeRoster, homeCoach);
  const awayStrength = calculateTeamStrength(awayRoster, awayCoach);
  
  let homeScore = 0;
  let awayScore = 0;
  const playByPlay = [];
  const playerStats = initializePlayerStats(homeRoster, awayRoster);
  
  // Simulate each quarter
  for (let quarter = 0; quarter < 4; quarter++) {
    const quarterPlays = simulateQuarter(
      quarter + 1,
      homeStrength,
      awayStrength,
      homeRoster,
      awayRoster,
      playerStats
    );
    
    playByPlay.push(...quarterPlays.plays);
    homeScore += quarterPlays.homePoints;
    awayScore += quarterPlays.awayPoints;
  }
  
  // Overtime if tied
  if (homeScore === awayScore) {
    const otPlays = simulateOvertime(homeStrength, awayStrength, homeRoster, awayRoster, playerStats);
    playByPlay.push(...otPlays.plays);
    homeScore += otPlays.homePoints;
    awayScore += otPlays.awayPoints;
  }
  
  return {
    ...game,
    homeScore,
    awayScore,
    played: true,
    playByPlay,
    playerStats,
    detailedSimulation: true,
  };
}

function calculateTeamStrength(roster, coach) {
  if (!roster || roster.length === 0) return 65;
  
  // Base strength from player ratings
  const totalRating = roster.reduce((sum, player) => {
    // Don't count injured players
    if (player.injury && player.injury.weeksRemaining > 0) return sum;
    return sum + player.overall;
  }, 0);
  
  const healthyPlayers = roster.filter(p => !p.injury || p.injury.weeksRemaining === 0);
  const baseStrength = healthyPlayers.length > 0 ? totalRating / healthyPlayers.length : 65;
  
  // Coach impact
  let coachBonus = 0;
  if (coach && coach.attributes) {
    const avgCoachRating = (coach.attributes.offense + coach.attributes.defense + coach.attributes.motivation) / 3;
    coachBonus = (avgCoachRating - 70) / 10;
  }
  
  return baseStrength + coachBonus;
}

function simulateQuarter(quarter, homeStrength, awayStrength, homeRoster, awayRoster, playerStats) {
  const plays = [];
  let homePoints = 0;
  let awayPoints = 0;
  
  // Simplified: 8-12 possessions per quarter
  const numPossessions = 4 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numPossessions; i++) {
    const offense = i % 2 === 0 ? 'home' : 'away';
    const offenseRoster = offense === 'home' ? homeRoster : awayRoster;
    const defenseRoster = offense === 'home' ? awayRoster : homeRoster;
    const offenseStrength = offense === 'home' ? homeStrength : awayStrength;
    const defenseStrength = offense === 'home' ? awayStrength : homeStrength;
    
    const drive = simulateDrive(quarter, offense, offenseRoster, defenseRoster, offenseStrength, defenseStrength, playerStats);
    plays.push(...drive.plays);
    
    if (offense === 'home') {
      homePoints += drive.points;
    } else {
      awayPoints += drive.points;
    }
  }
  
  return { plays, homePoints, awayPoints };
}

function simulateDrive(quarter, offense, offenseRoster, defenseRoster, offenseStrength, defenseStrength, playerStats) {
  const plays = [];
  let yardLine = 25; // Start at 25 yard line
  let down = 1;
  let yardsToGo = 10;
  let points = 0;
  
  // Drive can have 3-15 plays
  const maxPlays = 15;
  let playCount = 0;
  
  while (playCount < maxPlays && yardLine < 100 && down <= 4) {
    const play = simulatePlay(quarter, down, yardsToGo, yardLine, offense, offenseRoster, defenseRoster, offenseStrength, defenseStrength, playerStats);
    plays.push(play);
    playCount++;
    
    if (play.result === 'TOUCHDOWN') {
      points += 6;
      // Extra point
      const xp = Math.random() < 0.95;
      points += xp ? 1 : 0;
      plays.push({
        quarter: `Q${quarter}`,
        offense,
        type: xp ? PLAY_TYPES.EXTRA_POINT : 'Missed XP',
        description: xp ? 'Extra point is good!' : 'Extra point is NO GOOD!',
      });
      break;
    } else if (play.result === 'FIELD_GOAL') {
      const distance = 100 - yardLine + 17; // Add 17 for endzone + holder
      const fgChance = Math.max(0.3, Math.min(0.99, 1 - (distance - 30) / 80));
      if (Math.random() < fgChance) {
        points += 3;
        play.description += ` ${distance} yards - GOOD!`;
      } else {
        play.description += ` ${distance} yards - NO GOOD!`;
      }
      break;
    } else if (play.result === 'TURNOVER') {
      break;
    } else if (play.result === 'PUNT') {
      break;
    } else {
      yardLine += play.yards;
      yardsToGo -= play.yards;
      
      if (yardsToGo <= 0) {
        down = 1;
        yardsToGo = 10;
      } else {
        down++;
      }
      
      if (down > 4) {
        // Turnover on downs
        break;
      }
    }
  }
  
  return { plays, points };
}

function simulatePlay(quarter, down, yardsToGo, yardLine, offense, offenseRoster, defenseRoster, offenseStrength, defenseStrength, playerStats) {
  // Determine play type based on down and distance
  let playType;
  let yards = 0;
  let result = 'INCOMPLETE';
  
  const isGoalLine = yardLine >= 95;
  const strengthDiff = offenseStrength - defenseStrength;
  
  if (down === 4) {
    if (yardLine > 60 && yardLine < 97) {
      playType = PLAY_TYPES.FIELD_GOAL;
      result = 'FIELD_GOAL';
    } else {
      playType = PLAY_TYPES.PUNT;
      result = 'PUNT';
    }
  } else {
    // Choose play type
    const playChoice = Math.random();
    if (playChoice < 0.4) {
      playType = PLAY_TYPES.RUN;
      const baseYards = 3 + strengthDiff / 10;
      yards = Math.round(Math.max(-3, baseYards + (Math.random() * 8 - 4)));
      
      // Fumble chance
      if (Math.random() < 0.02) {
        playType = PLAY_TYPES.FUMBLE;
        result = 'TURNOVER';
        yards = 0;
      } else {
        result = yards >= yardsToGo ? 'FIRST_DOWN' : 'GAIN';
      }
    } else {
      playType = Math.random() < 0.5 ? PLAY_TYPES.SHORT_PASS : PLAY_TYPES.MEDIUM_PASS;
      
      // Sack chance
      if (Math.random() < 0.08) {
        playType = PLAY_TYPES.SACK;
        yards = -5 - Math.floor(Math.random() * 5);
        result = 'SACK';
      } else if (Math.random() < 0.03) {
        // Interception
        playType = PLAY_TYPES.INTERCEPTION;
        result = 'TURNOVER';
        yards = 0;
      } else {
        // Completion chance
        const completionChance = 0.6 + strengthDiff / 100;
        if (Math.random() < completionChance) {
          const baseYards = playType === PLAY_TYPES.SHORT_PASS ? 7 : 15;
          yards = Math.round(Math.max(0, baseYards + (Math.random() * 10 - 5)));
          result = yards >= yardsToGo ? 'FIRST_DOWN' : 'GAIN';
        } else {
          yards = 0;
          result = 'INCOMPLETE';
        }
      }
    }
  }
  
  // Check for touchdown
  if (yardLine + yards >= 100) {
    yards = 100 - yardLine;
    result = 'TOUCHDOWN';
  }
  
  const description = generatePlayDescription(playType, yards, result, offenseRoster);
  
  return {
    quarter: `Q${quarter}`,
    down,
    yardsToGo,
    yardLine,
    offense,
    type: playType,
    yards,
    result,
    description,
  };
}

function generatePlayDescription(playType, yards, result, roster) {
  const qb = roster.find(p => p.position === 'QB');
  const rb = roster.find(p => p.position === 'RB');
  const wr = roster.find(p => p.position === 'WR');
  
  const qbName = qb ? qb.lastName : 'QB';
  const rbName = rb ? rb.lastName : 'RB';
  const wrName = wr ? wr.lastName : 'WR';
  
  switch (playType) {
    case PLAY_TYPES.RUN:
      return `${rbName} runs for ${yards > 0 ? '+' : ''}${yards} yards`;
    case PLAY_TYPES.SHORT_PASS:
    case PLAY_TYPES.MEDIUM_PASS:
      if (result === 'INCOMPLETE') {
        return `${qbName} pass incomplete to ${wrName}`;
      }
      return `${qbName} pass to ${wrName} for ${yards} yards`;
    case PLAY_TYPES.SACK:
      return `${qbName} sacked for ${yards} yards`;
    case PLAY_TYPES.INTERCEPTION:
      return `${qbName} intercepted!`;
    case PLAY_TYPES.FUMBLE:
      return `${rbName} fumbles! Recovered by defense`;
    case PLAY_TYPES.PUNT:
      return 'Punt';
    case PLAY_TYPES.FIELD_GOAL:
      return 'Field goal attempt';
    default:
      return 'Play';
  }
}

function simulateOvertime(homeStrength, awayStrength, homeRoster, awayRoster, playerStats) {
  // Simplified OT - first to score wins
  const plays = [];
  let homePoints = 0;
  let awayPoints = 0;
  
  const firstPossession = Math.random() < 0.5 ? 'home' : 'away';
  const drive = simulateDrive(5, firstPossession, 
    firstPossession === 'home' ? homeRoster : awayRoster,
    firstPossession === 'home' ? awayRoster : homeRoster,
    firstPossession === 'home' ? homeStrength : awayStrength,
    firstPossession === 'home' ? awayStrength : homeStrength,
    playerStats
  );
  
  plays.push(...drive.plays);
  
  if (firstPossession === 'home') {
    homePoints += drive.points;
  } else {
    awayPoints += drive.points;
  }
  
  return { plays, homePoints, awayPoints };
}

function initializePlayerStats(homeRoster, awayRoster) {
  const stats = {};
  
  [...homeRoster, ...awayRoster].forEach(player => {
    stats[player.id] = {
      passingYards: 0,
      rushingYards: 0,
      receivingYards: 0,
      tackles: 0,
      sacks: 0,
      interceptions: 0,
    };
  });
  
  return stats;
}
