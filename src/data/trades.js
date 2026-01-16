// Trade System

// Create a trade proposal
export function createTradeProposal(fromTeamId, toTeamId, offeredPlayers, offeredPicks, requestedPlayers, requestedPicks) {
  return {
    id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fromTeamId,
    toTeamId,
    offeredPlayers, // Array of player IDs
    offeredPicks, // Array of draft pick IDs
    requestedPlayers, // Array of player IDs
    requestedPicks, // Array of draft pick IDs
    status: 'pending',
    createdWeek: 0,
    createdSeason: 0,
  };
}

// Calculate trade value for evaluation
export function calculateTradeValue(players, picks, rosters) {
  let totalValue = 0;
  
  // Player values
  players.forEach(playerId => {
    const player = findPlayerInRosters(playerId, rosters);
    if (player) {
      totalValue += calculatePlayerTradeValue(player);
    }
  });
  
  // Draft pick values
  picks.forEach(pick => {
    totalValue += calculatePickValue(pick);
  });
  
  return totalValue;
}

function calculatePlayerTradeValue(player) {
  // Base value on overall rating
  let value = player.overall * 100;
  
  // Age adjustment
  if (player.age < 26) {
    value *= 1.3; // Young players more valuable
  } else if (player.age > 30) {
    value *= Math.max(0.5, 1 - (player.age - 30) * 0.1);
  }
  
  // Contract adjustment
  if (player.contract && player.contract.salary > 10000000) {
    value *= 0.9; // Expensive contracts less valuable
  }
  
  // Position value
  const positionMultipliers = {
    QB: 2.5,
    LT: 1.5,
    DE: 1.4,
    CB: 1.4,
    WR: 1.3,
    DT: 1.2,
    LB: 1.1,
    S: 1.0,
    TE: 1.0,
    RB: 0.9,
    C: 0.9,
    LG: 0.85,
    RG: 0.85,
    RT: 1.3,
    FB: 0.7,
    K: 0.5,
    P: 0.5,
  };
  
  value *= positionMultipliers[player.position] || 1.0;
  
  return Math.round(value);
}

function calculatePickValue(pick) {
  // Draft pick value based on round and pick number
  const roundValues = {
    1: 10000,
    2: 5000,
    3: 3000,
    4: 2000,
    5: 1500,
    6: 1000,
    7: 500,
  };
  
  const baseValue = roundValues[pick.round] || 500;
  
  // Earlier picks in the round are more valuable
  const pickDiscount = (pick.pick - 1) * (baseValue * 0.02);
  
  return Math.max(100, baseValue - pickDiscount);
}

function findPlayerInRosters(playerId, rosters) {
  for (const roster of Object.values(rosters)) {
    const player = roster.find(p => p.id === playerId);
    if (player) return player;
  }
  return null;
}

// AI evaluation of trade proposal
export function evaluateTradeProposal(trade, rosters, currentTeamId) {
  const isReceiving = trade.toTeamId === currentTeamId;
  
  const offeredValue = calculateTradeValue(
    trade.offeredPlayers,
    trade.offeredPicks,
    rosters
  );
  
  const requestedValue = calculateTradeValue(
    trade.requestedPlayers,
    trade.requestedPicks,
    rosters
  );
  
  // AI accepts if they're getting more value
  if (isReceiving) {
    const valueRatio = offeredValue / (requestedValue || 1);
    
    // Accept if getting 90% or more value
    if (valueRatio >= 0.9) {
      // Random chance to accept even fair trades
      return Math.random() < 0.6 + (valueRatio - 0.9) * 2;
    }
  }
  
  return false;
}

// Execute a trade
export function executeTrade(trade, rosters, draftPicks) {
  const newRosters = { ...rosters };
  const newDraftPicks = [...draftPicks];
  
  // Transfer players
  trade.offeredPlayers.forEach(playerId => {
    const fromRoster = newRosters[trade.fromTeamId];
    const playerIndex = fromRoster.findIndex(p => p.id === playerId);
    
    if (playerIndex !== -1) {
      const player = fromRoster.splice(playerIndex, 1)[0];
      player.teamId = trade.toTeamId;
      newRosters[trade.toTeamId].push(player);
    }
  });
  
  trade.requestedPlayers.forEach(playerId => {
    const fromRoster = newRosters[trade.toTeamId];
    const playerIndex = fromRoster.findIndex(p => p.id === playerId);
    
    if (playerIndex !== -1) {
      const player = fromRoster.splice(playerIndex, 1)[0];
      player.teamId = trade.fromTeamId;
      newRosters[trade.fromTeamId].push(player);
    }
  });
  
  // Transfer draft picks
  trade.offeredPicks.forEach(pickId => {
    const pick = newDraftPicks.find(p => p.id === pickId);
    if (pick) {
      pick.teamId = trade.toTeamId;
      pick.traded = true;
    }
  });
  
  trade.requestedPicks.forEach(pickId => {
    const pick = newDraftPicks.find(p => p.id === pickId);
    if (pick) {
      pick.teamId = trade.fromTeamId;
      pick.traded = true;
    }
  });
  
  return { newRosters, newDraftPicks };
}
