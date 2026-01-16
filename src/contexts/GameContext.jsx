import React, { createContext, useState, useEffect } from 'react';
import { NFL_TEAMS } from '../data/teams';
import { generateRoster } from '../data/players';

// eslint-disable-next-line react-refresh/only-export-components
export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(() => {
    // Try to load saved game
    const saved = localStorage.getItem('footballSimSave');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
    
    // Default new game state
    return {
      initialized: false,
      userTeamId: null,
      userRole: null, // 'GM' or 'HC'
      currentWeek: 1,
      currentSeason: 2026,
      rosters: {},
      freeAgents: [],
      schedule: [],
      standings: {},
      gameResults: [],
      coaches: {},
      userCoach: null,
    };
  });

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState.initialized) {
      localStorage.setItem('footballSimSave', JSON.stringify(gameState));
    }
  }, [gameState]);

  const initializeGame = (teamId, role) => {
    // Generate rosters for all teams
    const rosters = {};
    NFL_TEAMS.forEach(team => {
      rosters[team.id] = generateRoster(team.id);
    });

    // Generate schedule (simplified)
    const schedule = generateSchedule();

    // Initialize standings
    const standings = {};
    NFL_TEAMS.forEach(team => {
      standings[team.id] = {
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      };
    });

    // Generate coaches for all teams
    const coaches = generateCoaches();

    setGameState({
      ...gameState,
      initialized: true,
      userTeamId: teamId,
      userRole: role,
      rosters,
      schedule,
      standings,
      coaches,
      userCoach: coaches[teamId],
    });
  };

  const updateRoster = (teamId, roster) => {
    setGameState(prev => ({
      ...prev,
      rosters: {
        ...prev.rosters,
        [teamId]: roster,
      },
    }));
  };

  const signFreeAgent = (playerId, teamId, contract) => {
    const player = gameState.freeAgents.find(p => p.id === playerId);
    if (!player) return;

    const updatedPlayer = {
      ...player,
      teamId,
      contract,
    };

    setGameState(prev => ({
      ...prev,
      freeAgents: prev.freeAgents.filter(p => p.id !== playerId),
      rosters: {
        ...prev.rosters,
        [teamId]: [...(prev.rosters[teamId] || []), updatedPlayer],
      },
    }));
  };

  const releasePlayer = (teamId, playerId) => {
    const roster = gameState.rosters[teamId];
    const player = roster.find(p => p.id === playerId);
    
    if (!player) return;

    setGameState(prev => ({
      ...prev,
      rosters: {
        ...prev.rosters,
        [teamId]: roster.filter(p => p.id !== playerId),
      },
      freeAgents: [...prev.freeAgents, { ...player, teamId: null }],
    }));
  };

  const advanceWeek = () => {
    // Simulate games for the week
    const weekGames = gameState.schedule.filter(
      game => game.week === gameState.currentWeek && game.season === gameState.currentSeason
    );

    const results = weekGames.map(game => simulateGame(game, gameState.rosters));

    // Update standings
    const newStandings = { ...gameState.standings };
    results.forEach(result => {
      const { homeTeam, awayTeam, homeScore, awayScore } = result;
      
      if (homeScore > awayScore) {
        newStandings[homeTeam].wins++;
        newStandings[awayTeam].losses++;
      } else if (awayScore > homeScore) {
        newStandings[awayTeam].wins++;
        newStandings[homeTeam].losses++;
      } else {
        newStandings[homeTeam].ties++;
        newStandings[awayTeam].ties++;
      }
      
      newStandings[homeTeam].pointsFor += homeScore;
      newStandings[homeTeam].pointsAgainst += awayScore;
      newStandings[awayTeam].pointsFor += awayScore;
      newStandings[awayTeam].pointsAgainst += homeScore;
    });

    setGameState(prev => ({
      ...prev,
      currentWeek: prev.currentWeek + 1,
      standings: newStandings,
      gameResults: [...prev.gameResults, ...results],
    }));
  };

  const resetGame = () => {
    localStorage.removeItem('footballSimSave');
    setGameState({
      initialized: false,
      userTeamId: null,
      userRole: null,
      currentWeek: 1,
      currentSeason: 2026,
      rosters: {},
      freeAgents: [],
      schedule: [],
      standings: {},
      gameResults: [],
      coaches: {},
      userCoach: null,
    });
  };

  const value = {
    gameState,
    initializeGame,
    updateRoster,
    signFreeAgent,
    releasePlayer,
    advanceWeek,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Helper functions
function generateSchedule() {
  const schedule = [];
  const teams = [...NFL_TEAMS];
  
  // Generate 18 weeks of games (simplified)
  for (let week = 1; week <= 18; week++) {
    const weekTeams = [...teams];
    const weekGames = [];
    
    while (weekTeams.length >= 2) {
      const homeIdx = Math.floor(Math.random() * weekTeams.length);
      const homeTeam = weekTeams.splice(homeIdx, 1)[0];
      
      const awayIdx = Math.floor(Math.random() * weekTeams.length);
      const awayTeam = weekTeams.splice(awayIdx, 1)[0];
      
      weekGames.push({
        id: `2026-W${week}-${homeTeam.id}-${awayTeam.id}`,
        season: 2026,
        week,
        homeTeam: homeTeam.id,
        awayTeam: awayTeam.id,
        played: false,
      });
    }
    
    schedule.push(...weekGames);
  }
  
  return schedule;
}

function generateCoaches() {
  const coaches = {};
  const firstNames = ['John', 'Mike', 'Bill', 'Tom', 'Sean', 'Kyle', 'Matt', 'Dan', 'Kevin', 'Andy'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
  
  NFL_TEAMS.forEach(team => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    coaches[team.id] = {
      id: `coach-${team.id}`,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      teamId: team.id,
      role: 'HC',
      experience: Math.floor(Math.random() * 15),
      offensiveScheme: ['West Coast', 'Spread', 'Power Run', 'Air Raid'][Math.floor(Math.random() * 4)],
      defensiveScheme: ['4-3', '3-4', 'Cover 3', 'Cover 2'][Math.floor(Math.random() * 4)],
      attributes: {
        offense: 50 + Math.floor(Math.random() * 40),
        defense: 50 + Math.floor(Math.random() * 40),
        motivation: 50 + Math.floor(Math.random() * 40),
      },
    };
  });
  
  return coaches;
}

function simulateGame(game, rosters) {
  const homeRoster = rosters[game.homeTeam] || [];
  const awayRoster = rosters[game.awayTeam] || [];
  
  // Calculate team strength based on roster
  const homeStrength = calculateTeamStrength(homeRoster);
  const awayStrength = calculateTeamStrength(awayRoster);
  
  const baseScore = 17;
  const variance = 14;
  
  let homeScore = baseScore + Math.floor(Math.random() * variance);
  let awayScore = baseScore + Math.floor(Math.random() * variance);
  
  // Adjust based on team strength (including home field advantage)
  homeScore += Math.floor((homeStrength - 70 + 3) / 10);
  awayScore += Math.floor((awayStrength - 70) / 10);
  
  // Ensure non-negative scores
  homeScore = Math.max(0, homeScore);
  awayScore = Math.max(0, awayScore);
  
  return {
    ...game,
    homeScore,
    awayScore,
    played: true,
  };
}

function calculateTeamStrength(roster) {
  if (!roster || roster.length === 0) return 65;
  
  const totalRating = roster.reduce((sum, player) => sum + player.overall, 0);
  return Math.floor(totalRating / roster.length);
}
