import React from 'react';
import { useGame } from '../hooks/useGame';
import { getTeamById } from '../data/teams';

export default function Playoffs() {
  const { gameState, advanceWeek } = useGame();
  const { playoffBracket } = gameState;
  
  if (!playoffBracket) {
    return (
      <div className="container">
        <h1>Playoffs</h1>
        <div className="card">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p className="text-muted">Playoffs will begin after the regular season.</p>
          </div>
        </div>
      </div>
    );
  }
  
  const renderSeed = (seed) => {
    const team = getTeamById(seed.teamId);
    return (
      <div className="list-item" style={{ background: 'var(--secondary-color)' }}>
        <div className="flex-between">
          <div>
            <span style={{ fontWeight: '700', marginRight: '0.5rem' }}>#{seed.seed}</span>
            <span style={{ fontWeight: '600' }}>{team?.name}</span>
          </div>
          <div className="text-right">
            <span style={{ fontWeight: '600' }}>{seed.wins}-{seed.losses}</span>
            {seed.isDivisionWinner && (
              <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.5rem' }}>DIV</span>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container">
      <h1>NFL Playoffs</h1>
      
      <div className="grid grid-2 mb-2">
        <div className="card">
          <div className="card-header">AFC Playoff Seeds</div>
          <div>
            {playoffBracket.seeds.AFC.map(seed => renderSeed(seed))}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">NFC Playoff Seeds</div>
          <div>
            {playoffBracket.seeds.NFC.map(seed => renderSeed(seed))}
          </div>
        </div>
      </div>
      
      {playoffBracket.wildCard.length > 0 && (
        <div className="card mb-2">
          <div className="card-header">Wild Card Round</div>
          <div>
            {playoffBracket.wildCard.map(game => {
              const home = getTeamById(game.homeTeam);
              const away = getTeamById(game.awayTeam);
              return (
                <div key={game.id} className="list-item">
                  <div className="flex-between">
                    <span>{away?.name} @ {home?.name}</span>
                    <span className="text-muted">{game.conference}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <button className="btn-primary" onClick={advanceWeek}>
        Simulate Playoff Games
      </button>
    </div>
  );
}
