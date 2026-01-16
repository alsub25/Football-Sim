// Season History Tracking

// Create season history entry
export function createSeasonHistory(season, teamId, standings, playoffs, awards) {
  return {
    season,
    teamId,
    record: {
      wins: standings.wins,
      losses: standings.losses,
      ties: standings.ties,
      pointsFor: standings.pointsFor,
      pointsAgainst: standings.pointsAgainst,
    },
    playoffResult: playoffs ? playoffs.result : 'Did not qualify',
    playoffSeed: playoffs ? playoffs.seed : null,
    awards: awards || [],
    teamStats: {
      offensiveRank: 0,
      defensiveRank: 0,
      pointsPerGameRank: 0,
    },
    topPlayers: [],
  };
}

// Add season to history
export function addSeasonToHistory(history, seasonData) {
  return [...history, seasonData];
}

// Get team's historical records
export function getTeamHistory(history, teamId) {
  return history.filter(season => season.teamId === teamId);
}

// Calculate career stats across seasons
export function calculateCareerStats(history) {
  return history.reduce(
    (totals, season) => ({
      totalWins: totals.totalWins + season.record.wins,
      totalLosses: totals.totalLosses + season.record.losses,
      totalTies: totals.totalTies + season.record.ties,
      playoffAppearances: totals.playoffAppearances + (season.playoffSeed ? 1 : 0),
      championships: totals.championships + (season.playoffResult === 'Super Bowl Champion' ? 1 : 0),
    }),
    {
      totalWins: 0,
      totalLosses: 0,
      totalTies: 0,
      playoffAppearances: 0,
      championships: 0,
    }
  );
}

// Track player season statistics
export function createPlayerSeasonStats(playerId, season, stats) {
  return {
    playerId,
    season,
    gamesPlayed: stats.gamesPlayed || 0,
    gamesStarted: stats.gamesStarted || 0,
    passingYards: stats.passingYards || 0,
    passingTDs: stats.passingTDs || 0,
    interceptions: stats.interceptions || 0,
    rushingYards: stats.rushingYards || 0,
    rushingTDs: stats.rushingTDs || 0,
    receivingYards: stats.receivingYards || 0,
    receivingTDs: stats.receivingTDs || 0,
    receptions: stats.receptions || 0,
    tackles: stats.tackles || 0,
    sacks: stats.sacks || 0,
    forcedFumbles: stats.forcedFumbles || 0,
    fieldGoalsMade: stats.fieldGoalsMade || 0,
    fieldGoalsAttempted: stats.fieldGoalsAttempted || 0,
  };
}

// Track advanced team statistics
export function createAdvancedTeamStats(teamId, season) {
  return {
    teamId,
    season,
    offense: {
      totalYards: 0,
      passingYards: 0,
      rushingYards: 0,
      yardsPerPlay: 0,
      yardsPerGame: 0,
      turnovers: 0,
      thirdDownConversions: 0,
      thirdDownAttempts: 0,
      redZoneScoring: 0,
      redZoneAttempts: 0,
    },
    defense: {
      totalYardsAllowed: 0,
      passingYardsAllowed: 0,
      rushingYardsAllowed: 0,
      yardsPerPlayAllowed: 0,
      turnoversForced: 0,
      sacks: 0,
      thirdDownStops: 0,
      redZoneStops: 0,
    },
    specialTeams: {
      kickReturnAverage: 0,
      puntReturnAverage: 0,
      fieldGoalPercentage: 0,
    },
  };
}

// Update player career statistics
export function updatePlayerCareerStats(player, seasonStats) {
  const currentCareerStats = player.careerStats || {
    seasonsPlayed: 0,
    totalGames: 0,
    totalPassingYards: 0,
    totalRushingYards: 0,
    totalReceivingYards: 0,
    totalTouchdowns: 0,
    totalTackles: 0,
    totalSacks: 0,
    totalInterceptions: 0,
  };
  
  return {
    ...player,
    careerStats: {
      seasonsPlayed: currentCareerStats.seasonsPlayed + 1,
      totalGames: currentCareerStats.totalGames + (seasonStats.gamesPlayed || 0),
      totalPassingYards: currentCareerStats.totalPassingYards + (seasonStats.passingYards || 0),
      totalRushingYards: currentCareerStats.totalRushingYards + (seasonStats.rushingYards || 0),
      totalReceivingYards: currentCareerStats.totalReceivingYards + (seasonStats.receivingYards || 0),
      totalTouchdowns: currentCareerStats.totalTouchdowns + 
        (seasonStats.passingTDs || 0) + (seasonStats.rushingTDs || 0) + (seasonStats.receivingTDs || 0),
      totalTackles: currentCareerStats.totalTackles + (seasonStats.tackles || 0),
      totalSacks: currentCareerStats.totalSacks + (seasonStats.sacks || 0),
      totalInterceptions: currentCareerStats.totalInterceptions + (seasonStats.interceptions || 0),
    },
  };
}

// Get league leaders for a stat category
export function getLeagueLeaders(playerSeasonStats, category, limit = 10) {
  return playerSeasonStats
    .sort((a, b) => (b[category] || 0) - (a[category] || 0))
    .slice(0, limit);
}

// Calculate awards (MVP, OPOY, DPOY, etc.)
export function calculateSeasonAwards(playerSeasonStats, standings) {
  const awards = [];
  
  // MVP - Best QB on playoff team
  const qbStats = playerSeasonStats.filter(p => p.position === 'QB');
  const playoffTeams = Object.entries(standings)
    .filter(([_, record]) => record.wins >= 10)
    .map(([teamId]) => teamId);
  
  const mvpCandidates = qbStats
    .filter(p => playoffTeams.includes(p.teamId))
    .sort((a, b) => (b.passingYards + b.passingTDs * 100) - (a.passingYards + a.passingTDs * 100));
  
  if (mvpCandidates.length > 0) {
    awards.push({
      type: 'MVP',
      playerId: mvpCandidates[0].playerId,
      playerName: mvpCandidates[0].playerName,
    });
  }
  
  return awards;
}
