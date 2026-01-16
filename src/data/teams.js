// NFL Teams Data
export const NFL_TEAMS = [
  // AFC East
  { id: 'BUF', name: 'Buffalo Bills', city: 'Buffalo', conference: 'AFC', division: 'East', colors: ['#00338D', '#C60C30'] },
  { id: 'MIA', name: 'Miami Dolphins', city: 'Miami', conference: 'AFC', division: 'East', colors: ['#008E97', '#FC4C02'] },
  { id: 'NE', name: 'New England Patriots', city: 'New England', conference: 'AFC', division: 'East', colors: ['#002244', '#C60C30'] },
  { id: 'NYJ', name: 'New York Jets', city: 'New York', conference: 'AFC', division: 'East', colors: ['#125740', '#FFFFFF'] },
  
  // AFC North
  { id: 'BAL', name: 'Baltimore Ravens', city: 'Baltimore', conference: 'AFC', division: 'North', colors: ['#241773', '#000000'] },
  { id: 'CIN', name: 'Cincinnati Bengals', city: 'Cincinnati', conference: 'AFC', division: 'North', colors: ['#FB4F14', '#000000'] },
  { id: 'CLE', name: 'Cleveland Browns', city: 'Cleveland', conference: 'AFC', division: 'North', colors: ['#311D00', '#FF3C00'] },
  { id: 'PIT', name: 'Pittsburgh Steelers', city: 'Pittsburgh', conference: 'AFC', division: 'North', colors: ['#FFB612', '#101820'] },
  
  // AFC South
  { id: 'HOU', name: 'Houston Texans', city: 'Houston', conference: 'AFC', division: 'South', colors: ['#03202F', '#A71930'] },
  { id: 'IND', name: 'Indianapolis Colts', city: 'Indianapolis', conference: 'AFC', division: 'South', colors: ['#002C5F', '#A2AAAD'] },
  { id: 'JAX', name: 'Jacksonville Jaguars', city: 'Jacksonville', conference: 'AFC', division: 'South', colors: ['#006778', '#D7A22A'] },
  { id: 'TEN', name: 'Tennessee Titans', city: 'Tennessee', conference: 'AFC', division: 'South', colors: ['#0C2340', '#4B92DB'] },
  
  // AFC West
  { id: 'DEN', name: 'Denver Broncos', city: 'Denver', conference: 'AFC', division: 'West', colors: ['#FB4F14', '#002244'] },
  { id: 'KC', name: 'Kansas City Chiefs', city: 'Kansas City', conference: 'AFC', division: 'West', colors: ['#E31837', '#FFB81C'] },
  { id: 'LV', name: 'Las Vegas Raiders', city: 'Las Vegas', conference: 'AFC', division: 'West', colors: ['#000000', '#A5ACAF'] },
  { id: 'LAC', name: 'Los Angeles Chargers', city: 'Los Angeles', conference: 'AFC', division: 'West', colors: ['#0080C6', '#FFC20E'] },
  
  // NFC East
  { id: 'DAL', name: 'Dallas Cowboys', city: 'Dallas', conference: 'NFC', division: 'East', colors: ['#041E42', '#869397'] },
  { id: 'NYG', name: 'New York Giants', city: 'New York', conference: 'NFC', division: 'East', colors: ['#0B2265', '#A71930'] },
  { id: 'PHI', name: 'Philadelphia Eagles', city: 'Philadelphia', conference: 'NFC', division: 'East', colors: ['#004C54', '#A5ACAF'] },
  { id: 'WAS', name: 'Washington Commanders', city: 'Washington', conference: 'NFC', division: 'East', colors: ['#5A1414', '#FFB612'] },
  
  // NFC North
  { id: 'CHI', name: 'Chicago Bears', city: 'Chicago', conference: 'NFC', division: 'North', colors: ['#0B162A', '#C83803'] },
  { id: 'DET', name: 'Detroit Lions', city: 'Detroit', conference: 'NFC', division: 'North', colors: ['#0076B6', '#B0B7BC'] },
  { id: 'GB', name: 'Green Bay Packers', city: 'Green Bay', conference: 'NFC', division: 'North', colors: ['#203731', '#FFB612'] },
  { id: 'MIN', name: 'Minnesota Vikings', city: 'Minnesota', conference: 'NFC', division: 'North', colors: ['#4F2683', '#FFC62F'] },
  
  // NFC South
  { id: 'ATL', name: 'Atlanta Falcons', city: 'Atlanta', conference: 'NFC', division: 'South', colors: ['#A71930', '#000000'] },
  { id: 'CAR', name: 'Carolina Panthers', city: 'Carolina', conference: 'NFC', division: 'South', colors: ['#0085CA', '#101820'] },
  { id: 'NO', name: 'New Orleans Saints', city: 'New Orleans', conference: 'NFC', division: 'South', colors: ['#D3BC8D', '#101820'] },
  { id: 'TB', name: 'Tampa Bay Buccaneers', city: 'Tampa Bay', conference: 'NFC', division: 'South', colors: ['#D50A0A', '#FF7900'] },
  
  // NFC West
  { id: 'ARI', name: 'Arizona Cardinals', city: 'Arizona', conference: 'NFC', division: 'West', colors: ['#97233F', '#000000'] },
  { id: 'LAR', name: 'Los Angeles Rams', city: 'Los Angeles', conference: 'NFC', division: 'West', colors: ['#003594', '#FFA300'] },
  { id: 'SF', name: 'San Francisco 49ers', city: 'San Francisco', conference: 'NFC', division: 'West', colors: ['#AA0000', '#B3995D'] },
  { id: 'SEA', name: 'Seattle Seahawks', city: 'Seattle', conference: 'NFC', division: 'West', colors: ['#002244', '#69BE28'] },
];

export const getTeamById = (id) => NFL_TEAMS.find(team => team.id === id);
export const getTeamsByDivision = (conference, division) => 
  NFL_TEAMS.filter(team => team.conference === conference && team.division === division);
