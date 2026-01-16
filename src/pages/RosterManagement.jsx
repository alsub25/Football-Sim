import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { POSITIONS } from '../data/players';

export default function RosterManagement() {
  const { gameState, releasePlayer } = useGame();
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('overall');
  
  const roster = gameState.rosters[gameState.userTeamId] || [];
  
  const filteredRoster = positionFilter === 'all'
    ? roster
    : roster.filter(p => p.position === positionFilter);
  
  const sortedRoster = [...filteredRoster].sort((a, b) => {
    if (sortBy === 'overall') return b.overall - a.overall;
    if (sortBy === 'age') return a.age - b.age;
    if (sortBy === 'salary') return b.contract.salary - a.contract.salary;
    if (sortBy === 'position') return a.position.localeCompare(b.position);
    return 0;
  });

  const totalSalary = roster.reduce((sum, p) => sum + p.contract.salary, 0);
  const salaryCap = 200000000; // $200M salary cap

  const positionGroups = {
    'Offense': ['QB', 'RB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'],
    'Defense': ['DE', 'DT', 'LB', 'CB', 'S'],
    'Special': ['K', 'P'],
  };

  const handleRelease = (playerId) => {
    if (window.confirm('Are you sure you want to release this player?')) {
      releasePlayer(gameState.userTeamId, playerId);
    }
  };

  const formatSalary = (salary) => {
    return `$${(salary / 1000000).toFixed(2)}M`;
  };

  const getRatingColor = (overall) => {
    if (overall >= 85) return 'var(--success)';
    if (overall >= 75) return 'var(--info)';
    if (overall >= 65) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="container">
      <div className="flex-between mb-2">
        <h1>Roster Management</h1>
        <div className="text-right">
          <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            {formatSalary(totalSalary)}
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>
            Cap: {formatSalary(salaryCap)}
          </div>
        </div>
      </div>

      <div className="card mb-2">
        <div className="card-header">Roster Overview</div>
        <div className="grid grid-2">
          {Object.entries(positionGroups).map(([group, positions]) => {
            const count = roster.filter(p => positions.includes(p.position)).length;
            return (
              <div key={group} className="flex-between">
                <span className="text-muted">{group}</span>
                <span style={{ fontWeight: '600' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card mb-2">
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ marginBottom: '0.5rem', display: 'block' }}>Filter by Position</label>
          <select 
            value={positionFilter} 
            onChange={(e) => setPositionFilter(e.target.value)}
          >
            <option value="all">All Positions</option>
            {Object.keys(POSITIONS).map(pos => (
              <option key={pos} value={pos}>{pos} - {POSITIONS[pos].name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ marginBottom: '0.5rem', display: 'block' }}>Sort by</label>
          <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
            <button 
              className={sortBy === 'overall' ? 'btn-primary btn-small' : 'btn-secondary btn-small'}
              onClick={() => setSortBy('overall')}
            >
              Overall
            </button>
            <button 
              className={sortBy === 'position' ? 'btn-primary btn-small' : 'btn-secondary btn-small'}
              onClick={() => setSortBy('position')}
            >
              Position
            </button>
            <button 
              className={sortBy === 'age' ? 'btn-primary btn-small' : 'btn-secondary btn-small'}
              onClick={() => setSortBy('age')}
            >
              Age
            </button>
            <button 
              className={sortBy === 'salary' ? 'btn-primary btn-small' : 'btn-secondary btn-small'}
              onClick={() => setSortBy('salary')}
            >
              Salary
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          Players ({sortedRoster.length})
        </div>
        
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Pos</th>
                <th>OVR</th>
                <th>Age</th>
                <th>Salary</th>
                <th>Years</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedRoster.map(player => (
                <tr key={player.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{player.fullName}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{player.position}</span>
                  </td>
                  <td>
                    <span style={{ 
                      fontWeight: '600', 
                      color: getRatingColor(player.overall)
                    }}>
                      {player.overall}
                    </span>
                  </td>
                  <td>{player.age}</td>
                  <td>{formatSalary(player.contract.salary)}</td>
                  <td>{player.contract.yearsLeft}y</td>
                  <td>
                    <button 
                      className="btn-danger btn-small"
                      onClick={() => handleRelease(player.id)}
                    >
                      Release
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
