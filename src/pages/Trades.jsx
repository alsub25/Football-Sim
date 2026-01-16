import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { getTeamById, NFL_TEAMS } from '../data/teams';
import { createTradeProposal, calculateTradeValue, evaluateTradeProposal, executeTrade } from '../data/trades';

export default function Trades() {
  const { gameState, setGameState } = useGame();
  const [step, setStep] = useState('select'); // 'select', 'build', 'review'
  const [targetTeam, setTargetTeam] = useState(null);
  const [offeredPlayers, setOfferedPlayers] = useState([]);
  const [requestedPlayers, setRequestedPlayers] = useState([]);
  
  const userTeam = getTeamById(gameState.userTeamId);
  const userRoster = gameState.rosters[gameState.userTeamId] || [];
  
  const startTrade = (teamId) => {
    setTargetTeam(teamId);
    setStep('build');
  };
  
  const togglePlayer = (playerId, side) => {
    if (side === 'offered') {
      if (offeredPlayers.includes(playerId)) {
        setOfferedPlayers(offeredPlayers.filter(id => id !== playerId));
      } else {
        setOfferedPlayers([...offeredPlayers, playerId]);
      }
    } else {
      if (requestedPlayers.includes(playerId)) {
        setRequestedPlayers(requestedPlayers.filter(id => id !== playerId));
      } else {
        setRequestedPlayers([...requestedPlayers, playerId]);
      }
    }
  };
  
  const proposeTrade = () => {
    const trade = createTradeProposal(
      gameState.userTeamId,
      targetTeam,
      offeredPlayers,
      [],
      requestedPlayers,
      []
    );
    
    // AI evaluates trade
    const accepted = evaluateTradeProposal(trade, gameState.rosters, targetTeam);
    
    if (accepted) {
      // Execute trade
      const { newRosters } = executeTrade(trade, gameState.rosters, []);
      
      setGameState(prev => ({
        ...prev,
        rosters: newRosters,
        trades: [...prev.trades, { ...trade, status: 'accepted' }],
      }));
      
      alert('Trade accepted!');
    } else {
      alert('Trade rejected. Try offering more value.');
    }
    
    // Reset
    setStep('select');
    setTargetTeam(null);
    setOfferedPlayers([]);
    setRequestedPlayers([]);
  };
  
  const offeredValue = calculateTradeValue(offeredPlayers, [], gameState.rosters);
  const requestedValue = calculateTradeValue(requestedPlayers, [], gameState.rosters);
  const valueRatio = offeredValue / (requestedValue || 1);
  
  if (step === 'select') {
    return (
      <div className="container">
        <h1>Trade Finder</h1>
        <p className="text-muted mb-2">Select a team to trade with</p>
        
        <div className="grid grid-2">
          {NFL_TEAMS.filter(t => t.id !== gameState.userTeamId).map(team => (
            <div key={team.id} className="card" style={{ cursor: 'pointer' }} onClick={() => startTrade(team.id)}>
              <div className="card-header">{team.name}</div>
              <div style={{ padding: '1rem' }}>
                <button className="btn-primary" style={{ width: '100%' }}>
                  Propose Trade
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (step === 'build') {
    const targetRoster = gameState.rosters[targetTeam] || [];
    const targetTeamInfo = getTeamById(targetTeam);
    
    return (
      <div className="container">
        <div className="flex-between mb-2">
          <h1>Trade with {targetTeamInfo?.name}</h1>
          <button className="btn-secondary" onClick={() => {
            setStep('select');
            setTargetTeam(null);
            setOfferedPlayers([]);
            setRequestedPlayers([]);
          }}>
            Cancel
          </button>
        </div>
        
        <div className="card mb-2">
          <div className="card-header">Trade Value</div>
          <div style={{ padding: '1rem' }}>
            <div className="flex-between mb-1">
              <span>You Offer:</span>
              <span style={{ fontWeight: '600' }}>{offeredValue.toLocaleString()}</span>
            </div>
            <div className="flex-between mb-1">
              <span>You Receive:</span>
              <span style={{ fontWeight: '600' }}>{requestedValue.toLocaleString()}</span>
            </div>
            <div className="flex-between">
              <span>Trade Balance:</span>
              <span style={{ 
                fontWeight: '700',
                color: valueRatio >= 0.9 ? 'var(--success)' : 'var(--danger)'
              }}>
                {valueRatio >= 0.9 ? '✓ Fair' : '✗ Unfair'} ({(valueRatio * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-2 mb-2">
          <div className="card">
            <div className="card-header">Your Players ({offeredPlayers.length} selected)</div>
            <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {userRoster.map(player => (
                <div 
                  key={player.id}
                  className="list-item"
                  style={{ 
                    cursor: 'pointer',
                    background: offeredPlayers.includes(player.id) ? 'var(--secondary-color)' : undefined
                  }}
                  onClick={() => togglePlayer(player.id, 'offered')}
                >
                  <div className="flex-between">
                    <div>
                      <div style={{ fontWeight: '600' }}>{player.fullName}</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {player.position} · {player.age} yrs
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontWeight: '700' }}>{player.overall}</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        ${(player.contract.salary / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">{targetTeamInfo?.name} Players ({requestedPlayers.length} selected)</div>
            <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {targetRoster.map(player => (
                <div 
                  key={player.id}
                  className="list-item"
                  style={{ 
                    cursor: 'pointer',
                    background: requestedPlayers.includes(player.id) ? 'var(--secondary-color)' : undefined
                  }}
                  onClick={() => togglePlayer(player.id, 'requested')}
                >
                  <div className="flex-between">
                    <div>
                      <div style={{ fontWeight: '600' }}>{player.fullName}</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {player.position} · {player.age} yrs
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontWeight: '700' }}>{player.overall}</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        ${(player.contract.salary / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <button 
          className="btn-primary"
          onClick={proposeTrade}
          disabled={offeredPlayers.length === 0 || requestedPlayers.length === 0}
          style={{ width: '100%' }}
        >
          Propose Trade
        </button>
      </div>
    );
  }
  
  return null;
}
