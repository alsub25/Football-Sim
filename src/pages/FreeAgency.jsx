import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { getTeamById } from '../data/teams';
import { calculateMarketValue, getCapSpace, calculateTeamSalary } from '../data/freeAgency';

export default function FreeAgency() {
  const { gameState, signFreeAgent, releasePlayer, startRegularSeason } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [offerYears, setOfferYears] = useState(3);
  const [filterPosition, setFilterPosition] = useState('ALL');
  
  const userTeam = getTeamById(gameState.userTeamId);
  const userRoster = gameState.rosters[gameState.userTeamId] || [];
  const teamSalary = calculateTeamSalary(userRoster);
  const capSpace = getCapSpace(userRoster);
  
  // Sort free agents by overall rating
  const freeAgents = [...(gameState.freeAgents || [])].sort((a, b) => b.overall - a.overall);
  
  const filteredAgents = filterPosition === 'ALL' 
    ? freeAgents 
    : freeAgents.filter(p => p.position === filterPosition);
  
  const handleSign = (player) => {
    const marketValue = calculateMarketValue(player);
    const totalCost = marketValue * offerYears;
    
    if (marketValue > capSpace) {
      alert('Not enough cap space to sign this player!');
      return;
    }
    
    const contract = {
      years: offerYears,
      yearsLeft: offerYears,
      salary: marketValue,
      type: 'Free Agent',
    };
    
    signFreeAgent(player.id, gameState.userTeamId, contract);
    setSelectedPlayer(null);
  };
  
  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];
  
  return (
    <div className="container">
      <div className="flex-between mb-2">
        <div>
          <h1>Free Agency</h1>
          <p className="text-muted">{userTeam?.name}</p>
        </div>
        <div className="text-right">
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: capSpace < 0 ? 'var(--danger)' : 'var(--success)' }}>
            ${(capSpace / 1000000).toFixed(1)}M
          </div>
          <div className="text-muted">Cap Space</div>
        </div>
      </div>
      
      <div className="grid grid-2 mb-2">
        <div className="card">
          <div className="card-header">Team Salary</div>
          <div style={{ padding: '1rem' }}>
            <div className="flex-between mb-1">
              <span className="text-muted">Total Salary</span>
              <span style={{ fontWeight: '600' }}>${(teamSalary / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex-between mb-1">
              <span className="text-muted">Salary Cap</span>
              <span style={{ fontWeight: '600' }}>$200.0M</span>
            </div>
            <div className="flex-between">
              <span className="text-muted">Roster Size</span>
              <span style={{ fontWeight: '600' }}>{userRoster.length}/53</span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">Actions</div>
          <div style={{ padding: '1rem' }}>
            <button 
              className="btn-primary"
              onClick={startRegularSeason}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            >
              Start Regular Season
            </button>
            <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>
              Sign free agents to improve your roster
            </p>
          </div>
        </div>
      </div>
      
      <div className="card mb-2">
        <div className="card-header">Filter by Position</div>
        <div style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {positions.map(pos => (
            <button
              key={pos}
              className={`btn-small ${filterPosition === pos ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterPosition(pos)}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          Available Free Agents ({filteredAgents.length})
        </div>
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {filteredAgents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="text-muted">No free agents available</p>
            </div>
          ) : (
            filteredAgents.map(player => {
              const marketValue = calculateMarketValue(player);
              const canAfford = marketValue <= capSpace;
              
              return (
                <div 
                  key={player.id}
                  className="list-item"
                  style={{ 
                    cursor: 'pointer',
                    background: selectedPlayer?.id === player.id ? 'var(--secondary-color)' : undefined,
                    opacity: canAfford ? 1 : 0.6,
                  }}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="flex-between">
                    <div>
                      <div style={{ fontWeight: '600' }}>{player.fullName}</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {player.position} · Age {player.age} · {player.experience} yrs exp
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                        {player.overall}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        ${(marketValue / 1000000).toFixed(1)}M/yr
                      </div>
                    </div>
                  </div>
                  {selectedPlayer?.id === player.id && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <div className="flex-between mb-1">
                        <span>Contract Length:</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {[1, 2, 3, 4, 5].map(years => (
                            <button
                              key={years}
                              className={`btn-small ${offerYears === years ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOfferYears(years);
                              }}
                            >
                              {years}yr
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-between mb-1">
                        <span>Total Value:</span>
                        <span style={{ fontWeight: '600' }}>
                          ${((marketValue * offerYears) / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <button 
                        className="btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSign(player);
                        }}
                        disabled={!canAfford}
                        style={{ width: '100%', marginTop: '0.5rem' }}
                      >
                        {canAfford ? `Sign ${player.firstName} ${player.lastName}` : 'Not Enough Cap Space'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
