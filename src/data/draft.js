import { FIRST_NAMES, LAST_NAMES, POSITIONS } from './players';

// Draft prospect generation
export function generateDraftProspects(year) {
  const prospects = [];
  const positions = Object.keys(POSITIONS);
  
  // Generate approximately 250 draft prospects across 7 rounds
  const prospectsPerRound = [
    32, // Round 1 - Elite prospects
    32, // Round 2 - Very good prospects
    32, // Round 3 - Good prospects
    32, // Round 4 - Average prospects
    32, // Round 5 - Below average
    45, // Round 6 - Depth pieces
    45, // Round 7 - Long shots
  ];

  let prospectId = 1;
  
  prospectsPerRound.forEach((count, roundIndex) => {
    const round = roundIndex + 1;
    
    for (let i = 0; i < count; i++) {
      const position = positions[Math.floor(Math.random() * positions.length)];
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      
      // Rating based on round - Round 1 players are better
      const baseRating = Math.max(50, Math.min(85, 85 - (round - 1) * 5 + Math.floor(Math.random() * 10) - 5));
      const potential = Math.min(99, baseRating + 10 + Math.floor(Math.random() * 15));
      
      prospects.push({
        id: `draft-${year}-${prospectId}`,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        position,
        age: 21 + Math.floor(Math.random() * 2),
        college: getRandomCollege(),
        overall: baseRating,
        potential,
        projectedRound: round,
        draftYear: year,
        drafted: false,
        draftedBy: null,
        draftPick: null,
      });
      
      prospectId++;
    }
  });
  
  return prospects;
}

// Generate draft order based on previous season standings
export function generateDraftOrder(standings, previousDraftPicks = []) {
  const teams = Object.keys(standings);
  
  // Sort teams by record (worst to best)
  const sortedTeams = teams.sort((a, b) => {
    const teamA = standings[a];
    const teamB = standings[b];
    
    const winPctA = teamA.wins / (teamA.wins + teamA.losses + teamA.ties);
    const winPctB = teamB.wins / (teamB.wins + teamB.losses + teamB.ties);
    
    if (winPctA !== winPctB) return winPctA - winPctB;
    
    // Tiebreaker: point differential
    const diffA = teamA.pointsFor - teamA.pointsAgainst;
    const diffB = teamB.pointsFor - teamB.pointsAgainst;
    return diffA - diffB;
  });
  
  const draftPicks = [];
  
  // Generate 7 rounds of picks
  for (let round = 1; round <= 7; round++) {
    sortedTeams.forEach((teamId, index) => {
      const pick = (round - 1) * 32 + index + 1;
      draftPicks.push({
        id: `pick-${pick}`,
        round,
        pick: index + 1,
        overallPick: pick,
        teamId,
        originalTeamId: teamId,
        prospect: null,
        traded: false,
      });
    });
  }
  
  return draftPicks;
}

function getRandomCollege() {
  const colleges = [
    'Alabama', 'Ohio State', 'Georgia', 'Michigan', 'Clemson', 
    'Texas', 'Oklahoma', 'USC', 'LSU', 'Florida',
    'Penn State', 'Oregon', 'Notre Dame', 'Florida State', 'Auburn',
    'Texas A&M', 'Wisconsin', 'Miami', 'Tennessee', 'Washington',
  ];
  return colleges[Math.floor(Math.random() * colleges.length)];
}

// Draft a player
export function draftPlayer(draftPick, prospect, teamId) {
  return {
    ...prospect,
    drafted: true,
    draftedBy: teamId,
    draftPick: draftPick.overallPick,
    teamId,
    experience: 0,
    contract: {
      years: 4,
      yearsLeft: 4,
      salary: calculateRookieSalary(draftPick.overallPick),
      type: 'Rookie',
    },
  };
}

function calculateRookieSalary(overallPick) {
  // Higher picks get more money
  const baseSalary = 500000;
  const pickBonus = Math.max(0, (32 - overallPick) * 100000);
  return baseSalary + pickBonus;
}
