// Injury types and their severity
export const INJURY_TYPES = {
  ANKLE_SPRAIN: { name: 'Ankle Sprain', minWeeks: 1, maxWeeks: 3, severity: 'Minor' },
  HAMSTRING: { name: 'Hamstring Strain', minWeeks: 2, maxWeeks: 4, severity: 'Minor' },
  CONCUSSION: { name: 'Concussion', minWeeks: 1, maxWeeks: 2, severity: 'Moderate' },
  SHOULDER: { name: 'Shoulder Injury', minWeeks: 3, maxWeeks: 6, severity: 'Moderate' },
  KNEE_SPRAIN: { name: 'Knee Sprain', minWeeks: 2, maxWeeks: 5, severity: 'Moderate' },
  BROKEN_FINGER: { name: 'Broken Finger', minWeeks: 3, maxWeeks: 5, severity: 'Moderate' },
  GROIN: { name: 'Groin Strain', minWeeks: 2, maxWeeks: 4, severity: 'Minor' },
  BACK: { name: 'Back Injury', minWeeks: 2, maxWeeks: 6, severity: 'Moderate' },
  ACL_TEAR: { name: 'ACL Tear', minWeeks: 30, maxWeeks: 40, severity: 'Major' },
  BROKEN_ARM: { name: 'Broken Arm', minWeeks: 6, maxWeeks: 10, severity: 'Major' },
  ACHILLES: { name: 'Achilles Tear', minWeeks: 30, maxWeeks: 45, severity: 'Major' },
};

// Generate an injury for a player
export function generateInjury() {
  const injuryKeys = Object.keys(INJURY_TYPES);
  const injuryKey = injuryKeys[Math.floor(Math.random() * injuryKeys.length)];
  const injury = INJURY_TYPES[injuryKey];
  
  const weeksOut = injury.minWeeks + Math.floor(Math.random() * (injury.maxWeeks - injury.minWeeks + 1));
  
  return {
    type: injuryKey,
    name: injury.name,
    severity: injury.severity,
    weeksOut,
    weeksRemaining: weeksOut,
    occurredWeek: 0, // Set by the game when injury occurs
    occurredSeason: 0,
  };
}

// Check if a player gets injured during a game
export function checkForInjury(player) {
  // Base injury chance: 3% per game
  const baseInjuryChance = 0.03;
  
  // Adjust based on player's injury attribute (higher = less likely to get injured)
  const injuryResistance = (player.attributes?.injury || 70) / 100;
  const injuryChance = baseInjuryChance * (1 - (injuryResistance - 0.5));
  
  return Math.random() < injuryChance;
}

// Heal injuries (called at end of each week)
export function healInjuries(roster) {
  return roster.map(player => {
    if (player.injury && player.injury.weeksRemaining > 0) {
      const updatedInjury = {
        ...player.injury,
        weeksRemaining: player.injury.weeksRemaining - 1,
      };
      
      return {
        ...player,
        injury: updatedInjury.weeksRemaining > 0 ? updatedInjury : null,
      };
    }
    return player;
  });
}

// Get injury report for a team
export function getInjuryReport(roster) {
  return roster
    .filter(player => player.injury && player.injury.weeksRemaining > 0)
    .map(player => ({
      player,
      injury: player.injury,
    }));
}
