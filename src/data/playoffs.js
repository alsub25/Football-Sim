// Playoff System

// Determine playoff seeding for both conferences
export function determinePlayoffSeeding(standings, NFL_TEAMS) {
  const afcTeams = NFL_TEAMS.filter(t => t.conference === 'AFC').map(t => t.id);
  const nfcTeams = NFL_TEAMS.filter(t => t.conference === 'NFC').map(t => t.id);
  
  const afcSeeding = seedConference(afcTeams, standings);
  const nfcSeeding = seedConference(nfcTeams, standings);
  
  return {
    AFC: afcSeeding,
    NFC: nfcSeeding,
  };
}

function seedConference(teamIds, standings) {
  // Get division winners (4 teams)
  const divisions = ['East', 'North', 'South', 'West'];
  const divisionWinners = [];
  
  divisions.forEach(division => {
    const divTeams = teamIds.filter(id => {
      // Find team in NFL_TEAMS to check division
      return true; // Simplified - would need team lookup
    });
    
    // Sort by wins
    const sorted = teamIds
      .map(id => ({ id, ...standings[id] }))
      .sort((a, b) => sortByRecord(a, b));
    
    // Top 4 are division winners (simplified)
    if (sorted.length > 0 && divisionWinners.length < 4) {
      divisionWinners.push(sorted[0].id);
    }
  });
  
  // Sort all teams by record
  const allTeamsSorted = teamIds
    .map(id => ({ id, ...standings[id] }))
    .sort((a, b) => sortByRecord(a, b));
  
  // Get top 7 teams
  const playoffTeams = allTeamsSorted.slice(0, 7);
  
  return playoffTeams.map((team, index) => ({
    seed: index + 1,
    teamId: team.id,
    wins: team.wins,
    losses: team.losses,
    ties: team.ties,
    isDivisionWinner: index < 4,
  }));
}

function sortByRecord(a, b) {
  // Calculate win percentage
  const totalA = a.wins + a.losses + a.ties;
  const totalB = b.wins + b.losses + b.ties;
  const winPctA = totalA > 0 ? (a.wins + a.ties * 0.5) / totalA : 0;
  const winPctB = totalB > 0 ? (b.wins + b.ties * 0.5) / totalB : 0;
  
  if (winPctB !== winPctA) return winPctB - winPctA;
  
  // Tiebreaker: point differential
  const diffA = a.pointsFor - a.pointsAgainst;
  const diffB = b.pointsFor - b.pointsAgainst;
  return diffB - diffA;
}

// Generate playoff bracket
export function generatePlayoffBracket(seeding) {
  const afcSeeds = seeding.AFC;
  const nfcSeeds = seeding.NFC;
  
  // Wild Card Round (2 vs 7, 3 vs 6, 4 vs 5)
  // Seed 1 gets bye
  const wildCardGames = [
    // AFC Wild Card
    { id: 'wc-afc-1', round: 'Wild Card', conference: 'AFC', homeTeam: afcSeeds[1].teamId, awayTeam: afcSeeds[6].teamId },
    { id: 'wc-afc-2', round: 'Wild Card', conference: 'AFC', homeTeam: afcSeeds[2].teamId, awayTeam: afcSeeds[5].teamId },
    { id: 'wc-afc-3', round: 'Wild Card', conference: 'AFC', homeTeam: afcSeeds[3].teamId, awayTeam: afcSeeds[4].teamId },
    // NFC Wild Card
    { id: 'wc-nfc-1', round: 'Wild Card', conference: 'NFC', homeTeam: nfcSeeds[1].teamId, awayTeam: nfcSeeds[6].teamId },
    { id: 'wc-nfc-2', round: 'Wild Card', conference: 'NFC', homeTeam: nfcSeeds[2].teamId, awayTeam: nfcSeeds[5].teamId },
    { id: 'wc-nfc-3', round: 'Wild Card', conference: 'NFC', homeTeam: nfcSeeds[3].teamId, awayTeam: nfcSeeds[4].teamId },
  ];
  
  return {
    wildCard: wildCardGames,
    divisional: [],
    conference: [],
    superBowl: null,
    seeds: seeding,
  };
}

// Advance playoff bracket after round completion
export function advancePlayoffBracket(bracket, results) {
  const newBracket = { ...bracket };
  
  if (results.round === 'Wild Card') {
    // Set up Divisional Round
    const afcWinners = results.games
      .filter(g => g.conference === 'AFC')
      .map(g => g.homeScore > g.awayScore ? g.homeTeam : g.awayTeam)
      .sort((a, b) => {
        const seedA = bracket.seeds.AFC.findIndex(s => s.teamId === a) + 1;
        const seedB = bracket.seeds.AFC.findIndex(s => s.teamId === b) + 1;
        return seedA - seedB;
      });
    
    const nfcWinners = results.games
      .filter(g => g.conference === 'NFC')
      .map(g => g.homeScore > g.awayScore ? g.homeTeam : g.awayTeam)
      .sort((a, b) => {
        const seedA = bracket.seeds.NFC.findIndex(s => s.teamId === a) + 1;
        const seedB = bracket.seeds.NFC.findIndex(s => s.teamId === b) + 1;
        return seedA - seedB;
      });
    
    newBracket.divisional = [
      // #1 seed plays lowest remaining seed
      { id: 'div-afc-1', round: 'Divisional', conference: 'AFC', homeTeam: bracket.seeds.AFC[0].teamId, awayTeam: afcWinners[2] },
      { id: 'div-afc-2', round: 'Divisional', conference: 'AFC', homeTeam: afcWinners[0], awayTeam: afcWinners[1] },
      { id: 'div-nfc-1', round: 'Divisional', conference: 'NFC', homeTeam: bracket.seeds.NFC[0].teamId, awayTeam: nfcWinners[2] },
      { id: 'div-nfc-2', round: 'Divisional', conference: 'NFC', homeTeam: nfcWinners[0], awayTeam: nfcWinners[1] },
    ];
  } else if (results.round === 'Divisional') {
    // Set up Conference Championships
    const afcWinner1 = results.games.find(g => g.id === 'div-afc-1');
    const afcWinner2 = results.games.find(g => g.id === 'div-afc-2');
    const nfcWinner1 = results.games.find(g => g.id === 'div-nfc-1');
    const nfcWinner2 = results.games.find(g => g.id === 'div-nfc-2');
    
    newBracket.conference = [
      { 
        id: 'conf-afc', 
        round: 'Conference', 
        conference: 'AFC',
        homeTeam: afcWinner1.homeScore > afcWinner1.awayScore ? afcWinner1.homeTeam : afcWinner1.awayTeam,
        awayTeam: afcWinner2.homeScore > afcWinner2.awayScore ? afcWinner2.homeTeam : afcWinner2.awayTeam,
      },
      { 
        id: 'conf-nfc', 
        round: 'Conference', 
        conference: 'NFC',
        homeTeam: nfcWinner1.homeScore > nfcWinner1.awayScore ? nfcWinner1.homeTeam : nfcWinner1.awayTeam,
        awayTeam: nfcWinner2.homeScore > nfcWinner2.awayScore ? nfcWinner2.homeTeam : nfcWinner2.awayTeam,
      },
    ];
  } else if (results.round === 'Conference') {
    // Set up Super Bowl
    const afcChamp = results.games.find(g => g.conference === 'AFC');
    const nfcChamp = results.games.find(g => g.conference === 'NFC');
    
    newBracket.superBowl = {
      id: 'superbowl',
      round: 'Super Bowl',
      homeTeam: nfcChamp.homeScore > nfcChamp.awayScore ? nfcChamp.homeTeam : nfcChamp.awayTeam,
      awayTeam: afcChamp.homeScore > afcChamp.awayScore ? afcChamp.homeTeam : afcChamp.awayTeam,
    };
  }
  
  return newBracket;
}

// Check if team made playoffs
export function isTeamInPlayoffs(teamId, seeding) {
  return seeding.AFC.some(s => s.teamId === teamId) || 
         seeding.NFC.some(s => s.teamId === teamId);
}
