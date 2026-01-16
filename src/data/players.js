// Player positions and their categories
export const POSITIONS = {
  // Offense
  QB: { name: 'Quarterback', category: 'Offense', unit: 'Offense', abbr: 'QB' },
  RB: { name: 'Running Back', category: 'Offense', unit: 'Offense', abbr: 'RB' },
  FB: { name: 'Fullback', category: 'Offense', unit: 'Offense', abbr: 'FB' },
  WR: { name: 'Wide Receiver', category: 'Offense', unit: 'Offense', abbr: 'WR' },
  TE: { name: 'Tight End', category: 'Offense', unit: 'Offense', abbr: 'TE' },
  LT: { name: 'Left Tackle', category: 'Offense', unit: 'Offense', abbr: 'LT' },
  LG: { name: 'Left Guard', category: 'Offense', unit: 'Offense', abbr: 'LG' },
  C: { name: 'Center', category: 'Offense', unit: 'Offense', abbr: 'C' },
  RG: { name: 'Right Guard', category: 'Offense', unit: 'Offense', abbr: 'RG' },
  RT: { name: 'Right Tackle', category: 'Offense', unit: 'Offense', abbr: 'RT' },
  
  // Defense
  DE: { name: 'Defensive End', category: 'Defense', unit: 'Defense', abbr: 'DE' },
  DT: { name: 'Defensive Tackle', category: 'Defense', unit: 'Defense', abbr: 'DT' },
  LB: { name: 'Linebacker', category: 'Defense', unit: 'Defense', abbr: 'LB' },
  CB: { name: 'Cornerback', category: 'Defense', unit: 'Defense', abbr: 'CB' },
  S: { name: 'Safety', category: 'Defense', unit: 'Defense', abbr: 'S' },
  
  // Special Teams
  K: { name: 'Kicker', category: 'Special Teams', unit: 'Special', abbr: 'K' },
  P: { name: 'Punter', category: 'Special Teams', unit: 'Special', abbr: 'P' },
};

// First names for player generation
export const FIRST_NAMES = [
  'James', 'John', 'Michael', 'David', 'William', 'Robert', 'Joseph', 'Thomas', 'Charles', 'Christopher',
  'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth', 'Joshua',
  'Kevin', 'Brian', 'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
  'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin',
  'Samuel', 'Raymond', 'Gregory', 'Frank', 'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler',
  'Aaron', 'Jose', 'Adam', 'Henry', 'Nathan', 'Douglas', 'Zachary', 'Peter', 'Kyle', 'Walter',
  'Ethan', 'Jeremy', 'Harold', 'Keith', 'Christian', 'Roger', 'Noah', 'Gerald', 'Carl', 'Terry',
  'Sean', 'Austin', 'Arthur', 'Lawrence', 'Jesse', 'Dylan', 'Bryan', 'Joe', 'Jordan', 'Billy',
];

// Last names for player generation
export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
  'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
];

// Generate a random player
export function generatePlayer(position, teamId, experience = 0) {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const age = experience === 0 ? 22 : 22 + experience + Math.floor(Math.random() * 3);
  
  // Base ratings vary by position
  const baseRating = 50 + Math.floor(Math.random() * 30);
  const potential = Math.min(99, baseRating + Math.floor(Math.random() * 20));
  
  return {
    id: `${teamId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    position,
    teamId,
    age,
    experience,
    overall: baseRating + Math.floor(experience * 2),
    potential,
    contract: experience === 0 ? generateRookieContract() : generateContract(baseRating),
    attributes: generateAttributes(position, baseRating),
    stats: {
      gamesPlayed: experience * 16,
      gamesStarted: Math.floor(experience * 12),
    },
  };
}

function generateRookieContract() {
  const baseSalary = 500000 + Math.floor(Math.random() * 500000);
  const signingBonus = baseSalary * 0.5;
  return {
    years: 4,
    yearsLeft: 4,
    salary: baseSalary,
    signingBonus,
    guaranteedMoney: baseSalary * 4 + signingBonus,
    type: 'Rookie',
    bonuses: {
      performance: {
        playingTime: Math.floor(baseSalary * 0.1),
        proRoster: Math.floor(baseSalary * 0.05),
      },
      milestones: {}
    },
    clauses: {
      noTrade: false,
      noFranchiseTag: false,
    }
  };
}

function generateContract(overall) {
  const baseValue = Math.floor((overall - 50) * 100000 + 1000000);
  const years = 1 + Math.floor(Math.random() * 4);
  const annualSalary = baseValue + Math.floor(Math.random() * 2000000);
  const signingBonus = annualSalary * years * 0.3;
  const guaranteedYears = Math.min(Math.ceil(years * 0.6), years);
  
  return {
    years,
    yearsLeft: years,
    salary: annualSalary,
    signingBonus,
    guaranteedMoney: annualSalary * guaranteedYears + signingBonus,
    type: 'Standard',
    bonuses: {
      performance: {
        roster: Math.floor(annualSalary * 0.05),
        playingTime: Math.floor(annualSalary * 0.08),
      },
      milestones: generateMilestoneBonuses(overall, annualSalary)
    },
    clauses: {
      noTrade: overall >= 85,
      noFranchiseTag: overall >= 90,
    }
  };
}

function generateMilestoneBonuses(overall, salary) {
  const bonuses = {};
  
  if (overall >= 75) {
    bonuses.probowl = Math.floor(salary * 0.15);
  }
  
  if (overall >= 80) {
    bonuses.allPro = Math.floor(salary * 0.25);
  }
  
  return bonuses;
}

function generateAttributes(position, baseRating) {
  const variance = 15;
  const attr = (base) => Math.max(30, Math.min(99, base + Math.floor(Math.random() * variance) - variance / 2));
  
  const common = {
    speed: attr(baseRating),
    strength: attr(baseRating),
    awareness: attr(baseRating),
    injury: attr(baseRating),
  };
  
  // Position-specific attributes
  switch (position) {
    case 'QB':
      return {
        ...common,
        throwing: attr(baseRating + 5),
        accuracy: attr(baseRating + 5),
        decisionMaking: attr(baseRating),
      };
    case 'RB':
    case 'FB':
      return {
        ...common,
        carrying: attr(baseRating),
        agility: attr(baseRating + 5),
        vision: attr(baseRating),
      };
    case 'WR':
      return {
        ...common,
        catching: attr(baseRating + 5),
        route: attr(baseRating),
        agility: attr(baseRating + 5),
      };
    case 'TE':
      return {
        ...common,
        catching: attr(baseRating),
        blocking: attr(baseRating),
        route: attr(baseRating - 5),
      };
    case 'LT':
    case 'LG':
    case 'C':
    case 'RG':
    case 'RT':
      return {
        ...common,
        blocking: attr(baseRating + 5),
        passBlock: attr(baseRating),
        runBlock: attr(baseRating),
      };
    case 'DE':
    case 'DT':
      return {
        ...common,
        tackle: attr(baseRating),
        passRush: attr(baseRating + 5),
        finesse: attr(baseRating - 5),
      };
    case 'LB':
      return {
        ...common,
        tackle: attr(baseRating + 5),
        coverage: attr(baseRating - 5),
        passRush: attr(baseRating),
      };
    case 'CB':
      return {
        ...common,
        coverage: attr(baseRating + 5),
        agility: attr(baseRating + 5),
        tackle: attr(baseRating - 10),
      };
    case 'S':
      return {
        ...common,
        coverage: attr(baseRating),
        tackle: attr(baseRating),
        zone: attr(baseRating),
      };
    case 'K':
    case 'P':
      return {
        ...common,
        power: attr(baseRating + 5),
        accuracy: attr(baseRating + 5),
      };
    default:
      return common;
  }
}

// Generate a full roster for a team
export function generateRoster(teamId) {
  const roster = [];
  
  // Offense
  roster.push(...Array(3).fill().map(() => generatePlayer('QB', teamId, Math.floor(Math.random() * 8))));
  roster.push(...Array(4).fill().map(() => generatePlayer('RB', teamId, Math.floor(Math.random() * 6))));
  roster.push(...Array(1).fill().map(() => generatePlayer('FB', teamId, Math.floor(Math.random() * 5))));
  roster.push(...Array(6).fill().map(() => generatePlayer('WR', teamId, Math.floor(Math.random() * 7))));
  roster.push(...Array(3).fill().map(() => generatePlayer('TE', teamId, Math.floor(Math.random() * 6))));
  
  // Offensive Line
  roster.push(...Array(2).fill().map(() => generatePlayer('LT', teamId, Math.floor(Math.random() * 8))));
  roster.push(...Array(2).fill().map(() => generatePlayer('LG', teamId, Math.floor(Math.random() * 8))));
  roster.push(...Array(2).fill().map(() => generatePlayer('C', teamId, Math.floor(Math.random() * 8))));
  roster.push(...Array(2).fill().map(() => generatePlayer('RG', teamId, Math.floor(Math.random() * 8))));
  roster.push(...Array(2).fill().map(() => generatePlayer('RT', teamId, Math.floor(Math.random() * 8))));
  
  // Defense
  roster.push(...Array(4).fill().map(() => generatePlayer('DE', teamId, Math.floor(Math.random() * 7))));
  roster.push(...Array(4).fill().map(() => generatePlayer('DT', teamId, Math.floor(Math.random() * 7))));
  roster.push(...Array(6).fill().map(() => generatePlayer('LB', teamId, Math.floor(Math.random() * 7))));
  roster.push(...Array(5).fill().map(() => generatePlayer('CB', teamId, Math.floor(Math.random() * 7))));
  roster.push(...Array(4).fill().map(() => generatePlayer('S', teamId, Math.floor(Math.random() * 7))));
  
  // Special Teams
  roster.push(generatePlayer('K', teamId, Math.floor(Math.random() * 5)));
  roster.push(generatePlayer('P', teamId, Math.floor(Math.random() * 5)));
  
  return roster;
}
