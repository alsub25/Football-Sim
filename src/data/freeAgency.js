// Free Agency System
import { calculateMarketValue } from '../utils/contractUtils';

// Generate free agent offers from teams
export function generateFreeAgentOffer(player, teamId, teamCapSpace) {
  const baseValue = calculateMarketValue(player);
  
  // Teams might offer more or less based on need
  const variance = 0.9 + Math.random() * 0.3; // 90% to 120% of market value
  const offerValue = Math.round(baseValue * variance);
  
  // Check if team can afford
  if (offerValue > teamCapSpace) {
    return null;
  }
  
  const years = calculateContractLength(player);
  
  return {
    teamId,
    playerId: player.id,
    years,
    totalValue: offerValue * years,
    annualValue: offerValue,
    guaranteed: Math.round(offerValue * years * 0.6),
  };
}

function calculateContractLength(player) {
  const age = player.age;
  
  if (age < 26) {
    return 3 + Math.floor(Math.random() * 3); // 3-5 years
  } else if (age < 30) {
    return 2 + Math.floor(Math.random() * 3); // 2-4 years
  } else {
    return 1 + Math.floor(Math.random() * 2); // 1-2 years
  }
}

// AI team decision on signing a free agent
export function shouldAISignFreeAgent(team, player, offer, roster, capSpace) {
  // Check if team has cap space
  if (offer.annualValue > capSpace) {
    return false;
  }
  
  // Check if team needs this position
  const positionPlayers = roster.filter(p => p.position === player.position);
  
  // If team has fewer than 2 players at position, high priority
  if (positionPlayers.length < 2) {
    return true;
  }
  
  // Check if player is better than worst starter
  const sortedByRating = positionPlayers.sort((a, b) => b.overall - a.overall);
  const worstStarter = sortedByRating[1] || sortedByRating[0];
  
  if (player.overall > worstStarter.overall + 5) {
    return Math.random() < 0.7; // 70% chance to sign upgrade
  }
  
  return false;
}

// Calculate team's total salary cap
export function calculateTeamSalary(roster) {
  return roster.reduce((total, player) => {
    return total + (player.contract?.salary || 0);
  }, 0);
}

// Get team's available cap space
export function getCapSpace(roster, salaryCapLimit = 200000000) {
  const totalSalary = calculateTeamSalary(roster);
  return salaryCapLimit - totalSalary;
}

// Release player and add to free agency
export function releasePlayerToFreeAgency(player) {
  return {
    ...player,
    teamId: null,
    contract: {
      ...player.contract,
      yearsLeft: 0,
    },
  };
}
