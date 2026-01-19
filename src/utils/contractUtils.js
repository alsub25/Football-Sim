// Utility functions for contract calculations

/**
 * Calculate the market value for a player based on overall rating, age, and position
 * @param {Object} player - The player object
 * @returns {number} - The calculated market value in dollars
 */
export function calculateMarketValue(player) {
  // Calculate market value based on overall, age, position
  const baseValue = (player.overall - 50) * 200000 + 2000000;
  const ageFactor = player.age < 30 ? 1.2 : player.age < 33 ? 1.0 : 0.8;
  const positionMultiplier = ['QB', 'LT', 'DE', 'CB'].includes(player.position) ? 1.3 : 1.0;
  
  return Math.floor(baseValue * ageFactor * positionMultiplier);
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
