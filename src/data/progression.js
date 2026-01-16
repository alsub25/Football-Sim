// Player progression and regression system

// Age ranges for player development
const DEVELOPMENT_STAGES = {
  YOUNG: { min: 21, max: 24, progressionRate: 1.5 },
  PRIME: { min: 25, max: 29, progressionRate: 0.3 },
  VETERAN: { min: 30, max: 33, progressionRate: -0.8 },
  OLD: { min: 34, max: 40, progressionRate: -2.0 },
};

// Apply end-of-season progression/regression
export function progressPlayer(player) {
  const age = player.age;
  let stage = DEVELOPMENT_STAGES.OLD;
  
  if (age <= DEVELOPMENT_STAGES.YOUNG.max) {
    stage = DEVELOPMENT_STAGES.YOUNG;
  } else if (age <= DEVELOPMENT_STAGES.PRIME.max) {
    stage = DEVELOPMENT_STAGES.PRIME;
  } else if (age <= DEVELOPMENT_STAGES.VETERAN.max) {
    stage = DEVELOPMENT_STAGES.VETERAN;
  }
  
  let ratingChange = stage.progressionRate;
  
  // Factor in potential
  if (player.overall < player.potential && ratingChange > 0) {
    // More room to grow
    const potentialGap = player.potential - player.overall;
    ratingChange = Math.min(ratingChange * 1.5, potentialGap);
  } else if (ratingChange > 0) {
    // At or above potential, slower growth
    ratingChange *= 0.5;
  }
  
  // Add some randomness
  ratingChange += (Math.random() * 2 - 1);
  
  // Calculate new overall
  let newOverall = Math.round(player.overall + ratingChange);
  newOverall = Math.max(40, Math.min(99, newOverall));
  
  // Progress attributes proportionally
  const progressionFactor = newOverall / player.overall;
  const newAttributes = {};
  
  for (const [key, value] of Object.entries(player.attributes || {})) {
    let newValue = Math.round(value * progressionFactor + (Math.random() * 2 - 1));
    newValue = Math.max(30, Math.min(99, newValue));
    newAttributes[key] = newValue;
  }
  
  return {
    ...player,
    overall: newOverall,
    attributes: newAttributes,
    age: age + 1,
    experience: player.experience + 1,
  };
}

// Apply training effects (mid-season)
export function applyTraining(player, trainingType, trainingQuality) {
  // Training types: 'strength', 'speed', 'skill', 'mental'
  const baseImprovement = trainingQuality * 0.5; // Quality is 1-10
  
  const newAttributes = { ...player.attributes };
  
  switch (trainingType) {
    case 'strength':
      if (newAttributes.strength) {
        newAttributes.strength = Math.min(99, newAttributes.strength + baseImprovement);
      }
      break;
    case 'speed':
      if (newAttributes.speed) {
        newAttributes.speed = Math.min(99, newAttributes.speed + baseImprovement);
      }
      if (newAttributes.agility) {
        newAttributes.agility = Math.min(99, newAttributes.agility + baseImprovement * 0.5);
      }
      break;
    case 'skill':
      // Improve position-specific skills
      for (const [key, value] of Object.entries(newAttributes)) {
        if (!['speed', 'strength', 'awareness', 'injury'].includes(key)) {
          newAttributes[key] = Math.min(99, value + baseImprovement * 0.7);
        }
      }
      break;
    case 'mental':
      if (newAttributes.awareness) {
        newAttributes.awareness = Math.min(99, newAttributes.awareness + baseImprovement);
      }
      break;
  }
  
  // Recalculate overall based on new attributes
  const attrValues = Object.values(newAttributes);
  const newOverall = Math.round(attrValues.reduce((sum, val) => sum + val, 0) / attrValues.length);
  
  return {
    ...player,
    overall: Math.min(99, newOverall),
    attributes: newAttributes,
  };
}

// Check if player should retire
export function shouldRetire(player) {
  if (player.age < 32) return false;
  
  // Higher chance as players get older or worse
  const ageChance = Math.max(0, (player.age - 35) * 0.15);
  const ratingChance = player.overall < 60 ? 0.1 : 0;
  
  return Math.random() < (ageChance + ratingChance);
}
