import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { POSITIONS } from '../data/players';

export default function DepthChart() {
  const { gameState } = useGame();
  const [selectedPosition, setSelectedPosition] = useState('QB');
  
  const roster = gameState.rosters[gameState.userTeamId] || [];
  
  const positionGroups = {
    'Offense': ['QB', 'RB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'],
    'Defense': ['DE', 'DT', 'LB', 'CB', 'S'],
    'Special': ['K', 'P'],
  };

  const getPlayersAtPosition = (position) => {
    return roster
      .filter(p => p.position === position)
      .sort((a, b) => b.overall - a.overall);
  };

  const getRatingColor = (overall) => {
    if (overall >= 85) return 'var(--success)';
    if (overall >= 75) return 'var(--info)';
    if (overall >= 65) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="container">
      <h1 className="mb-3">Depth Chart</h1>
      <p className="text-muted mb-3">Organize your players by position</p>

      {gameState.userRole === 'HC' ? (
        <div className="card mb-2" style={{ background: 'var(--info)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🎯</span>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                Head Coach Mode
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Set your depth chart and game strategy
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card mb-2" style={{ background: 'var(--secondary-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>👔</span>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                GM View
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Review your depth chart by position
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-2">
        <div className="card-header">Select Position</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '0.5rem' }}>
          {Object.entries(positionGroups).map(([group, positions]) => (
            <React.Fragment key={group}>
              {positions.map(pos => (
                <button
                  key={pos}
                  className={selectedPosition === pos ? 'btn-primary btn-small' : 'btn-secondary btn-small'}
                  onClick={() => setSelectedPosition(pos)}
                  style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                >
                  {pos}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          {selectedPosition} - {POSITIONS[selectedPosition]?.name}
        </div>

        {getPlayersAtPosition(selectedPosition).length === 0 ? (
          <div className="text-center" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>
              🔍
            </div>
            <div className="text-muted">No players at this position</div>
          </div>
        ) : (
          <ul className="list">
            {getPlayersAtPosition(selectedPosition).map((player, idx) => (
              <li key={player.id} className="list-item">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                      {idx === 0 ? 'STARTER' : `DEPTH ${idx + 1}`}
                    </span>
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                      {player.fullName}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div>
                      <span className="text-muted">Age: </span>
                      <span>{player.age}</span>
                    </div>
                    <div>
                      <span className="text-muted">Exp: </span>
                      <span>{player.experience}y</span>
                    </div>
                    <div>
                      <span className="text-muted">Contract: </span>
                      <span>{player.contract.yearsLeft}y left</span>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700',
                  color: getRatingColor(player.overall),
                  minWidth: '60px',
                  textAlign: 'center'
                }}>
                  {player.overall}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {gameState.userRole === 'HC' && (
        <div className="card mt-2" style={{ background: 'var(--surface-light)' }}>
          <div className="card-header">Coaching Notes</div>
          <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            <p className="text-muted">
              • Starters are automatically selected based on overall rating
            </p>
            <p className="text-muted">
              • Higher rated players will get more playing time
            </p>
            <p className="text-muted">
              • Ensure you have adequate depth at each position
            </p>
            <p className="text-muted">
              • Young players with high potential can develop into stars
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
