import React, { createContext, useState, useEffect } from 'react';
import { NFL_TEAMS } from '../data/teams';
import { generateRoster } from '../data/players';
import { generateDraftProspects, generateDraftOrder } from '../data/draft';
import { healInjuries, checkForInjury, generateInjury } from '../data/injuries';
import { progressPlayer, shouldRetire } from '../data/progression';
import { generateAllCoachingStaffs, progressCoach } from '../data/coaches';
import { determinePlayoffSeeding, generatePlayoffBracket } from '../data/playoffs';
import { simulateGameDetailed } from '../data/gameSimulation';
import { createSeasonHistory, addSeasonToHistory } from '../data/seasonHistory';

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
      seasonPhase: 'regular', // 'regular', 'playoffs', 'offseason', 'draft', 'freeAgency'
      rosters: {},
      freeAgents: [],
      schedule: [],
      standings: {},
      gameResults: [],
      coachingStaffs: {},
      draftProspects: [],
      draftPicks: [],
      currentDraftPick: 0,
      trades: [],
      seasonHistory: [],
      playerSeasonStats: {},
      teamSeasonStats: {},
      playoffBracket: null,
      playoffResults: [],
      trainingPrograms: {},
    };
  });

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState.initialized) {
      try {
        localStorage.setItem('footballSimSave', JSON.stringify(gameState));
      } catch (error) {
        console.error('Failed to save game state to localStorage:', error);
        // If quota exceeded, try to save a minimal version without game results
        if (error.name === 'QuotaExceededError') {
          try {
            const minimalState = {
              ...gameState,
              gameResults: gameState.gameResults.slice(-50), // Keep only last 50 games (same as main limit)
            };
            localStorage.setItem('footballSimSave', JSON.stringify(minimalState));
            console.log('Saved minimal game state after quota error');
          } catch (fallbackError) {
            console.error('Failed to save even minimal state:', fallbackError);
            alert('Warning: Unable to save game progress. Storage quota exceeded. Game will continue but may not save properly.');
          }
        }
      }
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

    // Generate coaching staffs for all teams
    const coachingStaffs = generateAllCoachingStaffs();
    
    // Generate draft prospects for current year
    const draftProspects = generateDraftProspects(2026);
    
    // Initialize player season stats
    const playerSeasonStats = {};

    setGameState({
      ...gameState,
      initialized: true,
      userTeamId: teamId,
      userRole: role,
      rosters,
      schedule,
      standings,
      coachingStaffs,
      draftProspects,
      playerSeasonStats,
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
    const currentPhase = gameState.seasonPhase;
    
    // Handle different season phases
    if (currentPhase === 'regular') {
      advanceRegularSeasonWeek();
    } else if (currentPhase === 'playoffs') {
      advancePlayoffWeek();
    }
  };
  
  const advanceRegularSeasonWeek = () => {
    try {
      console.log(`Simulating Week ${gameState.currentWeek}`);
      
      // Simulate games for the week
      const weekGames = gameState.schedule.filter(
        game => game.week === gameState.currentWeek && game.season === gameState.currentSeason
      );

      console.log(`Found ${weekGames.length} games for week ${gameState.currentWeek}`);

      const allPlayerStats = {}; // Accumulate player stats from all games this week
      
      const results = weekGames.map(game => {
        try {
          const result = simulateGameDetailed(game, gameState.rosters, gameState.coachingStaffs);
          
          // Accumulate player stats for season tracking
          if (result.playerStats) {
            Object.entries(result.playerStats).forEach(([playerId, stats]) => {
              if (!allPlayerStats[playerId]) {
                allPlayerStats[playerId] = { ...stats };
              } else {
                // Add stats to existing totals
                Object.keys(stats).forEach(statKey => {
                  allPlayerStats[playerId][statKey] = (allPlayerStats[playerId][statKey] || 0) + stats[statKey];
                });
              }
            });
          }
          
          // Remove detailed play-by-play data to reduce localStorage size
          // Only keep essential game result information
          // eslint-disable-next-line no-unused-vars -- Intentionally extracting and discarding these properties
          const { playByPlay, playerStats, ...essentialResult } = result;
          return essentialResult;
        } catch (error) {
          console.error(`Error simulating game ${game.id}:`, error);
          // Return a basic game result on error
          return {
            ...game,
            homeScore: 0,
            awayScore: 0,
            played: true,
            error: true
          };
        }
      });

      // Check for injuries during games
      const updatedRosters = { ...gameState.rosters };
      results.forEach(result => {
        // Check for injuries on both teams
        [result.homeTeam, result.awayTeam].forEach(teamId => {
          const roster = updatedRosters[teamId];
          if (!roster) {
            console.error(`No roster found for team ${teamId}`);
            return;
          }
          updatedRosters[teamId] = roster.map(player => {
            // Skip players already injured
            if (player.injury && player.injury.weeksRemaining > 0) return player;
            
            // Random chance of injury during game
            if (checkForInjury(player)) {
              const injury = generateInjury();
              injury.occurredWeek = gameState.currentWeek;
              injury.occurredSeason = gameState.currentSeason;
              return { ...player, injury };
            }
            return player;
          });
        });
      });
      
      // Heal injuries
      Object.keys(updatedRosters).forEach(teamId => {
        updatedRosters[teamId] = healInjuries(updatedRosters[teamId]);
      });

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

      // Check if regular season is over (week 18)
      const nextWeek = gameState.currentWeek + 1;
      const newPhase = nextWeek > 18 ? 'playoffs' : 'regular';
      
      let playoffBracket = gameState.playoffBracket;
      if (newPhase === 'playoffs') {
        // Generate playoff bracket
        const seeding = determinePlayoffSeeding(newStandings, NFL_TEAMS);
        playoffBracket = generatePlayoffBracket(seeding);
      }

      console.log(`Week ${gameState.currentWeek} simulation complete. Moving to week ${nextWeek}`);

      setGameState(prev => {
        // Keep only recent game results to prevent localStorage quota issues
        // Store last 50 games (enough for ~3 weeks of history across all teams)
        const updatedGameResults = [...prev.gameResults, ...results];
        const recentGameResults = updatedGameResults.slice(-50);

        // Update player season stats
        const updatedPlayerSeasonStats = { ...prev.playerSeasonStats };
        Object.entries(allPlayerStats).forEach(([playerId, stats]) => {
          if (!updatedPlayerSeasonStats[playerId]) {
            updatedPlayerSeasonStats[playerId] = { ...stats, gamesPlayed: 1 };
          } else {
            // Add stats to season totals
            Object.keys(stats).forEach(statKey => {
              updatedPlayerSeasonStats[playerId][statKey] = (updatedPlayerSeasonStats[playerId][statKey] || 0) + stats[statKey];
            });
            updatedPlayerSeasonStats[playerId].gamesPlayed = (updatedPlayerSeasonStats[playerId].gamesPlayed || 0) + 1;
          }
        });

        return {
          ...prev,
          currentWeek: newPhase === 'playoffs' ? 1 : nextWeek,
          seasonPhase: newPhase,
          standings: newStandings,
          rosters: updatedRosters,
          gameResults: recentGameResults,
          playoffBracket,
          playerSeasonStats: updatedPlayerSeasonStats,
        };
      });
    } catch (error) {
      console.error('Error in advanceRegularSeasonWeek:', error);
      alert(`Error simulating week ${gameState.currentWeek}: ${error.message}. Please try again or start a new career if the issue persists.`);
    }
  };
  
  const advancePlayoffWeek = () => {
    // Simulate playoff games
    // This is a simplified version - full implementation would track playoff rounds
    setGameState(prev => ({
      ...prev,
      seasonPhase: 'offseason',
    }));
  };

  const advanceToNextSeason = () => {
    // End of season processing
    const newRosters = { ...gameState.rosters };
    
    // Progress players
    Object.keys(newRosters).forEach(teamId => {
      newRosters[teamId] = newRosters[teamId]
        .map(player => progressPlayer(player))
        .filter(player => !shouldRetire(player));
    });
    
    // Progress coaches
    const newCoachingStaffs = {};
    Object.keys(gameState.coachingStaffs).forEach(teamId => {
      const staff = gameState.coachingStaffs[teamId];
      newCoachingStaffs[teamId] = {};
      Object.keys(staff).forEach(position => {
        newCoachingStaffs[teamId][position] = progressCoach(staff[position]);
      });
    });
    
    // Create season history
    const seasonData = createSeasonHistory(
      gameState.currentSeason,
      gameState.userTeamId,
      gameState.standings[gameState.userTeamId],
      null,
      []
    );
    const newHistory = addSeasonToHistory(gameState.seasonHistory, seasonData);
    
    // Generate new draft prospects
    const newDraftProspects = generateDraftProspects(gameState.currentSeason + 1);
    
    // Generate draft order based on standings
    const draftPicks = generateDraftOrder(gameState.standings);
    
    // Reset for new season
    const newSchedule = generateSchedule(gameState.currentSeason + 1);
    const newStandings = {};
    NFL_TEAMS.forEach(team => {
      newStandings[team.id] = {
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      };
    });
    
    setGameState(prev => ({
      ...prev,
      currentSeason: prev.currentSeason + 1,
      currentWeek: 1,
      seasonPhase: 'draft',
      rosters: newRosters,
      coachingStaffs: newCoachingStaffs,
      draftProspects: newDraftProspects,
      draftPicks,
      currentDraftPick: 0,
      schedule: newSchedule,
      standings: newStandings,
      gameResults: [],
      seasonHistory: newHistory,
      playoffBracket: null,
      playoffResults: [],
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
      seasonPhase: 'regular',
      rosters: {},
      freeAgents: [],
      schedule: [],
      standings: {},
      gameResults: [],
      coachingStaffs: {},
      draftProspects: [],
      draftPicks: [],
      currentDraftPick: 0,
      trades: [],
      seasonHistory: [],
      playerSeasonStats: {},
      teamSeasonStats: {},
      playoffBracket: null,
      playoffResults: [],
      trainingPrograms: {},
    });
  };
  
  const draftPlayer = (prospectId, pickId) => {
    const prospect = gameState.draftProspects.find(p => p.id === prospectId);
    const pick = gameState.draftPicks.find(p => p.id === pickId);
    
    if (!prospect || !pick) return;
    
    // Convert prospect to player
    const draftedPlayer = {
      ...prospect,
      drafted: true,
      draftedBy: pick.teamId,
      draftPick: pick.overallPick,
      teamId: pick.teamId,
      experience: 0,
      contract: {
        years: 4,
        yearsLeft: 4,
        salary: 500000 + (32 - pick.overallPick) * 100000,
        type: 'Rookie',
      },
    };
    
    setGameState(prev => ({
      ...prev,
      rosters: {
        ...prev.rosters,
        [pick.teamId]: [...prev.rosters[pick.teamId], draftedPlayer],
      },
      draftProspects: prev.draftProspects.map(p => 
        p.id === prospectId ? draftedPlayer : p
      ),
      currentDraftPick: prev.currentDraftPick + 1,
    }));
  };
  
  const completeDraft = () => {
    setGameState(prev => ({
      ...prev,
      seasonPhase: 'freeAgency',
    }));
  };
  
  const startRegularSeason = () => {
    setGameState(prev => ({
      ...prev,
      seasonPhase: 'regular',
      currentWeek: 1,
    }));
  };

  const value = {
    gameState,
    setGameState,
    initializeGame,
    updateRoster,
    signFreeAgent,
    releasePlayer,
    advanceWeek,
    advanceToNextSeason,
    resetGame,
    draftPlayer,
    completeDraft,
    startRegularSeason,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Helper functions
function generateSchedule(season = 2026) {
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
        id: `${season}-W${week}-${homeTeam.id}-${awayTeam.id}`,
        season,
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
