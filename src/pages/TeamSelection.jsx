import React, { useState } from 'react';
import { NFL_TEAMS } from '../data/teams';

export default function TeamSelection({ onSelectTeam }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedRole, setSelectedRole] = useState('GM');
  const [filter, setFilter] = useState('all');

  const filteredTeams = filter === 'all' 
    ? NFL_TEAMS 
    : NFL_TEAMS.filter(team => team.conference === filter);

  const handleStart = () => {
    if (selectedTeam) {
      onSelectTeam(selectedTeam, selectedRole);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="text-center mb-3">
        <h1 style={{ color: 'var(--accent-color)' }}>🏈 NFL Football Simulation</h1>
        <p className="text-muted">Select your team and role to begin your journey</p>
      </div>

      <div className="card mb-2">
        <div className="card-header">Choose Your Role</div>
        <div className="grid grid-2">
          <button 
            className={selectedRole === 'GM' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setSelectedRole('GM')}
          >
            <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>👔</div>
            <div style={{ fontWeight: '600' }}>General Manager</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              Manage roster, contracts, draft, trades
            </div>
          </button>
          <button 
            className={selectedRole === 'HC' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setSelectedRole('HC')}
          >
            <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🎯</div>
            <div style={{ fontWeight: '600' }}>Head Coach</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              Set depth chart, game plans, call plays
            </div>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Choose Your Team</div>
        
        <div className="flex gap-1 mb-2" style={{ flexWrap: 'wrap' }}>
          <button 
            className={filter === 'all' ? 'btn-primary btn-small' : 'btn-secondary btn-small'}
            onClick={() => setFilter('all')}
          >
            All Teams
          </button>
          <button 
            className={filter === 'AFC' ? 'btn-primary btn-small' : 'btn-secondary btn-small'}
            onClick={() => setFilter('AFC')}
          >
            AFC
          </button>
          <button 
            className={filter === 'NFC' ? 'btn-primary btn-small' : 'btn-secondary btn-small'}
            onClick={() => setFilter('NFC')}
          >
            NFC
          </button>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <ul className="list">
            {filteredTeams.map(team => (
              <li 
                key={team.id}
                className="list-item"
                style={{
                  cursor: 'pointer',
                  background: selectedTeam === team.id ? 'var(--accent-color)' : 'var(--surface-light)',
                  borderColor: selectedTeam === team.id ? 'var(--accent-color)' : 'var(--border)',
                }}
                onClick={() => setSelectedTeam(team.id)}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {team.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    {team.conference} {team.division}
                  </div>
                </div>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  background: team.colors[0],
                  border: `2px solid ${team.colors[1] || '#fff'}`
                }} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button 
        className="btn-primary" 
        style={{ width: '100%', marginTop: '1rem' }}
        onClick={handleStart}
        disabled={!selectedTeam}
      >
        Start Career
      </button>
    </div>
  );
}
