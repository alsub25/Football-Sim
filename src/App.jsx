import React, { useState } from 'react';
import { GameProvider } from './contexts/GameContext';
import { useGame } from './hooks/useGame';
import { getTeamById } from './data/teams';
import TeamSelection from './pages/TeamSelection';
import Dashboard from './pages/Dashboard';
import RosterManagement from './pages/RosterManagement';
import DepthChart from './pages/DepthChart';
import Standings from './pages/Standings';
import Draft from './pages/Draft';
import FreeAgency from './pages/FreeAgency';
import Injuries from './pages/Injuries';
import Coaching from './pages/Coaching';
import Playoffs from './pages/Playoffs';
import History from './pages/History';
import Trades from './pages/Trades';
import Statistics from './pages/Statistics';

function GameContent() {
  const { gameState, initializeGame, resetGame } = useGame();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!gameState.initialized) {
    return <TeamSelection onSelectTeam={initializeGame} />;
  }

  const team = getTeamById(gameState.userTeamId);
  const seasonPhase = gameState.seasonPhase;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', show: true },
    { id: 'roster', label: 'Roster', icon: '👥', show: seasonPhase === 'regular' || seasonPhase === 'playoffs' },
    { id: 'depth', label: 'Depth Chart', icon: '📊', show: seasonPhase === 'regular' || seasonPhase === 'playoffs' },
    { id: 'standings', label: 'Standings', icon: '🏆', show: seasonPhase === 'regular' || seasonPhase === 'playoffs' },
    { id: 'injuries', label: 'Injuries', icon: '🏥', show: seasonPhase === 'regular' || seasonPhase === 'playoffs' },
    { id: 'statistics', label: 'Stats', icon: '📈', show: true },
    { id: 'coaching', label: 'Coaches', icon: '👔', show: true },
    { id: 'trades', label: 'Trades', icon: '🔄', show: seasonPhase === 'regular' || seasonPhase === 'freeAgency' },
    { id: 'draft', label: 'Draft', icon: '🎯', show: seasonPhase === 'draft' },
    { id: 'freeagency', label: 'Free Agency', icon: '✍️', show: seasonPhase === 'freeAgency' },
    { id: 'playoffs', label: 'Playoffs', icon: '🏈', show: seasonPhase === 'playoffs' },
    { id: 'history', label: 'History', icon: '📚', show: true },
  ].filter(item => item.show);

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
        {currentPage === 'injuries' && <Injuries />}
        {currentPage === 'statistics' && <Statistics />}
        {currentPage === 'coaching' && <Coaching />}
        {currentPage === 'trades' && <Trades />}
        {currentPage === 'draft' && <Draft />}
        {currentPage === 'freeagency' && <FreeAgency />}
        {currentPage === 'playoffs' && <Playoffs />}
        {currentPage === 'history' && <History />}
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
