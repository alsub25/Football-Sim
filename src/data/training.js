// Practice and Training Systems

export const TRAINING_TYPES = {
  STRENGTH: {
    name: 'Strength Training',
    description: 'Improve strength and power',
    focusAttributes: ['strength'],
    cost: 50000,
  },
  SPEED: {
    name: 'Speed & Agility',
    description: 'Improve speed and agility',
    focusAttributes: ['speed', 'agility'],
    cost: 50000,
  },
  SKILL: {
    name: 'Position Skills',
    description: 'Improve position-specific skills',
    focusAttributes: ['route', 'catching', 'coverage', 'tackle', 'throwing', 'accuracy'],
    cost: 75000,
  },
  MENTAL: {
    name: 'Film Study',
    description: 'Improve awareness and decision making',
    focusAttributes: ['awareness', 'decisionMaking'],
    cost: 25000,
  },
};

export const PRACTICE_INTENSITIES = {
  LIGHT: {
    name: 'Light Practice',
    injuryRisk: 0.01,
    improvementMultiplier: 0.5,
    fatigueIncrease: 5,
  },
  MODERATE: {
    name: 'Moderate Practice',
    injuryRisk: 0.02,
    improvementMultiplier: 1.0,
    fatigueIncrease: 10,
  },
  INTENSE: {
    name: 'Intense Practice',
    injuryRisk: 0.04,
    improvementMultiplier: 1.5,
    fatigueIncrease: 20,
  },
};

// Create a training program for a player
export function createTrainingProgram(player, trainingType, intensity, weeks = 4) {
  return {
    id: `training-${player.id}-${Date.now()}`,
    playerId: player.id,
    trainingType,
    intensity,
    startWeek: 0, // Set by game
    weeksTotal: weeks,
    weeksRemaining: weeks,
    completed: false,
  };
}

// Apply weekly training progress
export function applyWeeklyTraining(player, trainingProgram, practiceIntensity) {
  if (!trainingProgram || trainingProgram.completed) {
    return player;
  }
  
  const training = TRAINING_TYPES[trainingProgram.trainingType];
  const intensity = PRACTICE_INTENSITIES[practiceIntensity];
  
  if (!training || !intensity) {
    return player;
  }
  
  const baseImprovement = 0.3 * intensity.improvementMultiplier;
  const newAttributes = { ...player.attributes };
  
  // Apply improvements to focus attributes
  training.focusAttributes.forEach(attr => {
    if (newAttributes[attr]) {
      const improvement = baseImprovement + (Math.random() * 0.3);
      newAttributes[attr] = Math.min(99, Math.round(newAttributes[attr] + improvement));
    }
  });
  
  // Recalculate overall
  const attrValues = Object.values(newAttributes);
  const newOverall = Math.round(attrValues.reduce((sum, val) => sum + val, 0) / attrValues.length);
  
  return {
    ...player,
    overall: Math.min(99, newOverall),
    attributes: newAttributes,
  };
}

// Complete training program
export function completeTrainingProgram(trainingProgram) {
  return {
    ...trainingProgram,
    weeksRemaining: 0,
    completed: true,
  };
}

// Calculate team practice quality based on facilities and coaches
export function calculatePracticeQuality(coachingStaff, facilitiesRating = 70) {
  let coachingQuality = 70;
  
  if (coachingStaff && coachingStaff.HC) {
    coachingQuality = coachingStaff.HC.attributes.playerDevelopment || 70;
  }
  
  // Combine coaching and facilities (60/40 split)
  return (coachingQuality * 0.6 + facilitiesRating * 0.4);
}

// Apply practice effects to entire roster
export function applyPracticeToRoster(roster, practiceIntensity, practiceQuality) {
  return roster.map(player => {
    // Skip injured players
    if (player.injury && player.injury.weeksRemaining > 0) {
      return player;
    }
    
    const intensity = PRACTICE_INTENSITIES[practiceIntensity];
    if (!intensity) {
      return player;
    }
    
    // Small random improvement based on practice quality
    const improvementChance = practiceQuality / 100;
    
    if (Math.random() < improvementChance * 0.1) {
      const newAttributes = { ...player.attributes };
      const attrKeys = Object.keys(newAttributes);
      const randomAttr = attrKeys[Math.floor(Math.random() * attrKeys.length)];
      
      const improvement = 0.2 * intensity.improvementMultiplier;
      newAttributes[randomAttr] = Math.min(99, Math.round(newAttributes[randomAttr] + improvement));
      
      const attrValues = Object.values(newAttributes);
      const newOverall = Math.round(attrValues.reduce((sum, val) => sum + val, 0) / attrValues.length);
      
      return {
        ...player,
        overall: Math.min(99, newOverall),
        attributes: newAttributes,
      };
    }
    
    return player;
  });
}

// Get recommended training for player based on weaknesses
export function getRecommendedTraining(player) {
  const attributes = player.attributes;
  
  if (!attributes) {
    return 'SKILL';
  }
  
  // Find weakest attribute category
  const strength = attributes.strength || 70;
  const speed = (attributes.speed || 70) + (attributes.agility || 70) / 2;
  const awareness = attributes.awareness || 70;
  
  const scores = {
    STRENGTH: strength,
    SPEED: speed,
    MENTAL: awareness,
    SKILL: 70,
  };
  
  // Return training for weakest area
  let weakest = 'SKILL';
  let lowestScore = 100;
  
  for (const [type, score] of Object.entries(scores)) {
    if (score < lowestScore) {
      lowestScore = score;
      weakest = type;
    }
  }
  
  return weakest;
}
