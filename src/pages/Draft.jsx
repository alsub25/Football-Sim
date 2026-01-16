import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { getTeamById } from '../data/teams';

export default function Draft() {
  const { gameState, draftPlayer, completeDraft } = useGame();
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [filterPosition, setFilterPosition] = useState('ALL');
  
  const userTeam = getTeamById(gameState.userTeamId);
  const currentPick = gameState.draftPicks[gameState.currentDraftPick];
  const isUserPick = currentPick?.teamId === gameState.userTeamId;
  
  // Filter prospects who haven't been drafted
  const availableProspects = gameState.draftProspects.filter(p => !p.drafted);
  
  const filteredProspects = filterPosition === 'ALL' 
    ? availableProspects 
    : availableProspects.filter(p => p.position === filterPosition);
  
  const handleDraft = (prospectId) => {
    if (!currentPick) return;
    
    draftPlayer(prospectId, currentPick.id);
    setSelectedProspect(null);
    
    // Auto-draft for other teams
    setTimeout(() => {
      simulateAIDrafts();
    }, 1000);
  };
  
  const simulateAIDrafts = () => {
    // Simple AI draft logic - pick best available player
    let pickIndex = gameState.currentDraftPick;
    
    while (pickIndex < gameState.draftPicks.length) {
      const pick = gameState.draftPicks[pickIndex];
      
      if (pick.teamId === gameState.userTeamId) {
        break;
      }
      
      // AI picks best available player
      const available = gameState.draftProspects.filter(p => !p.drafted);
      if (available.length > 0) {
        const bestProspect = available.sort((a, b) => b.overall - a.overall)[0];
        draftPlayer(bestProspect.id, pick.id);
      }
      
      pickIndex++;
    }
  };
  
  const handleSkipToUserPick = () => {
    simulateAIDrafts();
  };
  
  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];
  
  if (!currentPick) {
    return (
      <div className="container">
        <h1>Draft Complete</h1>
        <div className="card">
          <div className="card-header">Draft Results</div>
          <p style={{ padding: '1rem' }}>
            The {gameState.currentSeason} NFL Draft is complete!
          </p>
          <button className="btn-primary" onClick={completeDraft}>
            Continue to Free Agency
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="flex-between mb-2">
        <div>
          <h1>{gameState.currentSeason} NFL Draft</h1>
          <p className="text-muted">{userTeam?.name}</p>
        </div>
        <div className="text-right">
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            Round {currentPick.round}
          </div>
          <div className="text-muted">Pick {currentPick.pick} (#{currentPick.overallPick})</div>
        </div>
      </div>
      
      <div className="card mb-2" style={{ background: isUserPick ? 'var(--secondary-color)' : 'var(--card-bg)' }}>
        <div className="card-header">
          {isUserPick ? 'Your Pick!' : `On the Clock: ${getTeamById(currentPick.teamId)?.name}`}
        </div>
        <div style={{ padding: '1rem' }}>
          <div className="flex-between">
            <span>Round {currentPick.round}, Pick {currentPick.pick}</span>
            <span className="text-muted">Overall: #{currentPick.overallPick}</span>
          </div>
          {!isUserPick && (
            <button 
              className="btn-secondary" 
              onClick={handleSkipToUserPick}
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              Skip to Your Pick
            </button>
          )}
        </div>
      </div>
      
      {isUserPick && (
        <>
          <div className="card mb-2">
            <div className="card-header">Filter Prospects</div>
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
              Available Prospects ({filteredProspects.length})
            </div>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {filteredProspects.slice(0, 50).map(prospect => (
                <div 
                  key={prospect.id}
                  className="list-item"
                  style={{ 
                    cursor: 'pointer',
                    background: selectedProspect?.id === prospect.id ? 'var(--secondary-color)' : undefined
                  }}
                  onClick={() => setSelectedProspect(prospect)}
                >
                  <div className="flex-between">
                    <div>
                      <div style={{ fontWeight: '600' }}>{prospect.fullName}</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {prospect.position} · {prospect.college} · Age {prospect.age}
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                        {prospect.overall}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        Pot: {prospect.potential}
                      </div>
                    </div>
                  </div>
                  {selectedProspect?.id === prospect.id && (
                    <div style={{ marginTop: '1rem' }}>
                      <button 
                        className="btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDraft(prospect.id);
                        }}
                        style={{ width: '100%' }}
                      >
                        Draft {prospect.firstName} {prospect.lastName}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
