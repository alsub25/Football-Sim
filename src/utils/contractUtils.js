// Utility functions for contract calculations

/**
 * Calculate the market value for a player based on overall rating, age, and position
 * This uses the same formula as freeAgency.js to ensure consistency
 * @param {Object} player - The player object
 * @returns {number} - The calculated market value in dollars
 */
export function calculateMarketValue(player) {
  const overall = player.overall;
  const age = player.age;
  const position = player.position;
  
  // Base salary based on overall rating
  let baseValue = (overall - 50) * 150000 + 1000000;
  
  // Age adjustment
  if (age < 25) {
    baseValue *= 1.1; // Young players worth more
  } else if (age > 30) {
    baseValue *= Math.max(0.6, 1 - (age - 30) * 0.1); // Older players worth less
  }
  
  // Position value adjustment
  const positionMultipliers = {
    QB: 2.0,
    LT: 1.4,
    RT: 1.3,
    DE: 1.3,
    CB: 1.3,
    WR: 1.2,
    DT: 1.1,
    LB: 1.0,
    S: 0.95,
    TE: 0.95,
    RB: 0.85,
    C: 0.9,
    LG: 0.85,
    RG: 0.85,
    FB: 0.7,
    K: 0.6,
    P: 0.6,
  };
  
  baseValue *= positionMultipliers[position] || 1.0;
  
  return Math.round(baseValue);
}

/**
 * Calculate guaranteed money based on salary, contract length, signing bonus, and guaranteed percentage
 * @param {number} salary - Annual salary
 * @param {number} years - Contract length in years
 * @param {number} signingBonus - Signing bonus amount
 * @param {number} guaranteedPercentage - Percentage of contract that's guaranteed (0-100)
 * @returns {number} - Total guaranteed money
 */
export function calculateGuaranteedMoney(salary, years, signingBonus, guaranteedPercentage) {
  const guaranteedYears = Math.ceil(years * guaranteedPercentage / 100);
  return salary * guaranteedYears + signingBonus;
}
