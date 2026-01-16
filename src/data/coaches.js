import { NFL_TEAMS } from './teams';

// Coach positions
export const COACH_POSITIONS = {
  HC: 'Head Coach',
  OC: 'Offensive Coordinator',
  DC: 'Defensive Coordinator',
  STC: 'Special Teams Coordinator',
};

// Generate a coach
export function generateCoach(teamId, position = 'HC') {
  const firstNames = ['John', 'Mike', 'Bill', 'Tom', 'Sean', 'Kyle', 'Matt', 'Dan', 'Kevin', 'Andy', 'Brian', 'Jim', 'Pete', 'Bruce', 'Ron'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Moore'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  const experience = Math.floor(Math.random() * 20);
  
  return {
    id: `coach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    teamId,
    position,
    experience,
    age: 35 + experience,
    offensiveScheme: getRandomScheme('offense'),
    defensiveScheme: getRandomScheme('defense'),
    attributes: {
      offense: 50 + Math.floor(Math.random() * 40),
      defense: 50 + Math.floor(Math.random() * 40),
      motivation: 50 + Math.floor(Math.random() * 40),
      playerDevelopment: 50 + Math.floor(Math.random() * 40),
    },
    contract: {
      years: 3 + Math.floor(Math.random() * 3),
      yearsLeft: 3 + Math.floor(Math.random() * 3),
      salary: position === 'HC' ? 3000000 + Math.floor(Math.random() * 7000000) : 500000 + Math.floor(Math.random() * 1500000),
    },
  };
}

function getRandomScheme(type) {
  if (type === 'offense') {
    const schemes = ['West Coast', 'Spread', 'Power Run', 'Air Raid', 'Pro Style', 'Run and Shoot'];
    return schemes[Math.floor(Math.random() * schemes.length)];
  } else {
    const schemes = ['4-3', '3-4', 'Cover 3', 'Cover 2', 'Tampa 2', 'Nickel'];
    return schemes[Math.floor(Math.random() * schemes.length)];
  }
}

// Generate complete coaching staff for a team
export function generateCoachingStaff(teamId) {
  return {
    HC: generateCoach(teamId, 'HC'),
    OC: generateCoach(teamId, 'OC'),
    DC: generateCoach(teamId, 'DC'),
    STC: generateCoach(teamId, 'STC'),
  };
}

// Generate coaching staffs for all teams
export function generateAllCoachingStaffs() {
  const staffs = {};
  
  NFL_TEAMS.forEach(team => {
    staffs[team.id] = generateCoachingStaff(team.id);
  });
  
  return staffs;
}

// Calculate coaching staff impact on team
export function calculateCoachingImpact(coachingStaff) {
  if (!coachingStaff || !coachingStaff.HC) return 0;
  
  const hcImpact = (coachingStaff.HC.attributes.offense + coachingStaff.HC.attributes.defense + coachingStaff.HC.attributes.motivation) / 3;
  
  let coordinatorImpact = 0;
  let coordinatorCount = 0;
  
  if (coachingStaff.OC) {
    coordinatorImpact += coachingStaff.OC.attributes.offense;
    coordinatorCount++;
  }
  
  if (coachingStaff.DC) {
    coordinatorImpact += coachingStaff.DC.attributes.defense;
    coordinatorCount++;
  }
  
  if (coachingStaff.STC) {
    coordinatorImpact += (coachingStaff.STC.attributes.offense + coachingStaff.STC.attributes.defense) / 2;
    coordinatorCount++;
  }
  
  const avgCoordinatorImpact = coordinatorCount > 0 ? coordinatorImpact / coordinatorCount : 70;
  
  // Head coach has 60% weight, coordinators 40%
  return (hcImpact * 0.6 + avgCoordinatorImpact * 0.4 - 70) / 10;
}

// Generate available coaches for hiring
export function generateAvailableCoaches(position, count = 10) {
  const coaches = [];
  
  for (let i = 0; i < count; i++) {
    coaches.push(generateCoach(null, position));
  }
  
  return coaches.sort((a, b) => {
    const avgA = (a.attributes.offense + a.attributes.defense + a.attributes.motivation) / 3;
    const avgB = (b.attributes.offense + b.attributes.defense + b.attributes.motivation) / 3;
    return avgB - avgA;
  });
}

// Fire a coach
export function fireCoach(coachingStaff, position) {
  const newStaff = { ...coachingStaff };
  delete newStaff[position];
  return newStaff;
}

// Hire a coach
export function hireCoach(coachingStaff, coach, position) {
  return {
    ...coachingStaff,
    [position]: {
      ...coach,
      position,
    },
  };
}

// Coach progression (experience gain)
export function progressCoach(coach) {
  const experience = coach.experience + 1;
  const age = coach.age + 1;
  
  // Small chance to improve attributes with experience
  const newAttributes = { ...coach.attributes };
  
  if (Math.random() < 0.3) {
    const attrKeys = Object.keys(newAttributes);
    const randomAttr = attrKeys[Math.floor(Math.random() * attrKeys.length)];
    newAttributes[randomAttr] = Math.min(99, newAttributes[randomAttr] + 1);
  }
  
  return {
    ...coach,
    experience,
    age,
    attributes: newAttributes,
    contract: {
      ...coach.contract,
      yearsLeft: Math.max(0, coach.contract.yearsLeft - 1),
    },
  };
}

// Check if coach contract is expiring
export function isCoachContractExpiring(coach) {
  return coach.contract && coach.contract.yearsLeft <= 1;
}
