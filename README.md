# 🏈 NFL Football Simulation

A comprehensive, mobile-first American football simulation game where you can manage an NFL team as either a General Manager or Head Coach.

![Team Selection](https://github.com/user-attachments/assets/f610a501-af5f-4015-a46e-7bb59a8d66d3)

## Features

### 🎮 Dual Role System
- **General Manager (GM) Mode**: Focus on roster building, contract negotiations, salary cap management, and long-term team construction
- **Head Coach (HC) Mode**: Manage depth charts, game plans, and lead your team to victory on the field

### 🏟️ Complete NFL Experience
- **All 32 NFL Teams**: Choose from any team in the league with accurate team colors and divisions
- **Full Rosters**: Each team has a complete 53-man roster with players at all positions
- **Realistic Player Attributes**: Players have position-specific ratings, age, experience, and contracts
- **Season Simulation**: Simulate an 18-week NFL season with realistic game outcomes
- **Standings & Statistics**: Track your team's performance across the season

### 💼 GM Mode Features
- **Roster Management**: View and manage your 53-man roster
- **Salary Cap Management**: $200M salary cap with real contract values
- **Player Contracts**: Negotiate contracts with varying lengths and salaries
- **Roster Decisions**: Release players, manage free agents, and build your championship team
- **Roster Analytics**: Sort and filter players by position, overall rating, age, and salary

### 🎯 Head Coach Mode Features
- **Depth Chart Management**: Set your depth chart for all positions
- **Position Groups**: Organize offense, defense, and special teams
- **Player Development**: Young players can develop into stars over time
- **Game Strategy**: Make strategic decisions to lead your team to victory

### 📊 Game Systems
- **Week-by-Week Simulation**: Simulate games one week at a time
- **Realistic Scoring**: Games generate realistic NFL scores based on team strength
- **Standings Tracking**: Full division and conference standings
- **Game Results**: View recent game results and scores
- **Season Progression**: Advance through multiple seasons

### 📱 Mobile-First Design
- **Responsive Layout**: Optimized for mobile, tablet, and desktop
- **Touch-Friendly Controls**: Large buttons and easy navigation
- **Smooth Animations**: Modern UI with smooth transitions
- **Dark Theme**: Easy on the eyes with a professional football-themed design
- **Sticky Navigation**: Always accessible menu system

## Screenshots

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/52ee56ed-4ace-4635-be65-168d781757e9)

### Roster Management
![Roster Management](https://github.com/user-attachments/assets/8c2d3ad0-7d17-4485-bddd-85a10a064fe8)

### Depth Chart
![Depth Chart](https://github.com/user-attachments/assets/5697f21b-8638-440b-a9b4-92e1a33545aa)

### NFL Standings
![Standings](https://github.com/user-attachments/assets/f8e22231-50e0-406b-abb1-a85249f2761c)

### Game Simulation
![Simulation](https://github.com/user-attachments/assets/deb9af3a-3951-460d-a3d4-7fdf510cf728)

### Mobile View
![Mobile](https://github.com/user-attachments/assets/1be64a59-6195-4ace-9006-3f73172e6caa)

## Technology Stack

- **React 19**: Modern React with hooks for state management
- **Vite**: Lightning-fast build tool and dev server
- **CSS3**: Custom mobile-first responsive design
- **LocalStorage**: Persistent game saves

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/alsub25/Football-Sim.git
cd Football-Sim
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## How to Play

### Starting Your Career

1. **Choose Your Role**:
   - Select either General Manager or Head Coach
   - Each role offers unique gameplay experiences

2. **Select Your Team**:
   - Browse all 32 NFL teams
   - Filter by conference (AFC/NFC)
   - Each team starts with a complete roster

3. **Manage Your Team**:
   - **Dashboard**: View team stats, schedule, and recent results
   - **Roster**: Manage your 53-man roster and salary cap
   - **Depth Chart**: Organize players by position
   - **Standings**: Track league-wide standings

4. **Simulate Games**:
   - Advance week-by-week through the season
   - Watch your team compete based on roster strength
   - Track wins, losses, and playoff positioning

### Game Mechanics

- **Player Ratings**: Each player has an Overall (OVR) rating from 50-99
- **Team Strength**: Calculated from average roster ratings
- **Home Field Advantage**: Home teams get a slight boost
- **Salary Cap**: Manage a $200M budget for player contracts
- **Contracts**: Players have multi-year deals with varying salaries
- **Experience**: Players gain experience over multiple seasons

## Project Structure

```
Football-Sim/
├── src/
│   ├── components/        # Reusable React components
│   ├── contexts/          # React Context for state management
│   │   └── GameContext.jsx    # Main game state
│   ├── data/              # Game data and generators
│   │   ├── teams.js       # NFL teams data
│   │   └── players.js     # Player generation system
│   ├── pages/             # Main page components
│   │   ├── TeamSelection.jsx
│   │   ├── Dashboard.jsx
│   │   ├── RosterManagement.jsx
│   │   ├── DepthChart.jsx
│   │   └── Standings.jsx
│   ├── App.jsx            # Main app component
│   ├── index.css          # Mobile-first styles
│   └── main.jsx           # App entry point
├── public/                # Static assets
├── index.html             # HTML template
└── package.json           # Dependencies and scripts
```

## Features in Detail

### Player Generation System
- Dynamic player creation with realistic names
- Position-specific attributes (e.g., QBs have throwing/accuracy, CBs have coverage)
- Age and experience variation
- Potential ratings for young players
- Rookie and veteran contracts

### Game Simulation
- Team strength calculated from roster averages
- Realistic score generation with variance
- Home field advantage factored in
- Standings automatically updated after each week

### Data Persistence
- Game state automatically saved to browser's LocalStorage
- Resume your career anytime
- Start a new career to reset

## Future Enhancements

Potential features for future versions:
- NFL Draft system with 7 rounds
- Free Agency with player bidding
- Trade system between teams
- Player injuries and recovery
- Playoff system and Super Bowl
- Player progression and regression
- Coach attributes and schemes
- Practice and training systems
- More detailed game simulation
- Play-by-play results
- Advanced statistics tracking
- Multiple season history

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with React and Vite
- Inspired by classic football management games
- NFL team names and divisions are used for simulation purposes

---

**Start your journey to a championship today! 🏆**
