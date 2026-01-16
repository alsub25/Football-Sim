import React, { useState } from 'react';
import { GameProvider } from './contexts/GameContext';
import { useGame } from './hooks/useGame';
import { getTeamById } from './data/teams';
import TeamSelection from './pages/TeamSelection';
import Dashboard from './pages/Dashboard';
import RosterManagement from './pages/RosterManagement';
import DepthChart from './pages/DepthChart';
import Standings from './pages/Standings';

function GameContent() {
  const { gameState, initializeGame, resetGame } = useGame();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!gameState.initialized) {
    return <TeamSelection onSelectTeam={initializeGame} />;
  }

  const team = getTeamById(gameState.userTeamId);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'roster', label: 'Roster', icon: '👥' },
    { id: 'depth', label: 'Depth Chart', icon: '📊' },
    { id: 'standings', label: 'Standings', icon: '🏆' },
  ];

  return (
    <>
      <nav className="nav">
        <div className="nav-brand">
          🏈 {team?.name}
        </div>
        <button 
          className="btn-danger btn-small"
          onClick={() => {
            if (window.confirm('Are you sure you want to start a new career? All progress will be lost.')) {
              resetGame();
              setCurrentPage('dashboard');
            }
          }}
        >
          New Career
        </button>
      </nav>

      <div className="nav" style={{ top: 'auto' }}>
        <div className="nav-menu" style={{ width: '100%', justifyContent: 'space-around' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span style={{ marginRight: '0.25rem' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ flex: 1, paddingBottom: '80px' }}>
        {currentPage === 'dashboard' && <Dashboard currentPage={currentPage} setCurrentPage={setCurrentPage} />}
        {currentPage === 'roster' && <RosterManagement />}
        {currentPage === 'depth' && <DepthChart />}
        {currentPage === 'standings' && <Standings />}
      </main>
    </>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
