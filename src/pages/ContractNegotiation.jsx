import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import ContractModal from '../components/ContractModal';

export default function ContractNegotiation() {
  const { gameState, updateRoster } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const roster = gameState.rosters[gameState.userTeamId] || [];
  
  // Find players who need contract extensions (2 years or less remaining)
  const eligiblePlayers = roster.filter(player => 
    player.contract && player.contract.yearsLeft <= 2
  ).sort((a, b) => b.overall - a.overall);

  const formatSalary = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const getRatingColor = (rating) => {
    if (rating >= 85) return 'var(--success)';
    if (rating >= 75) return 'var(--info)';
    if (rating >= 65) return 'var(--warning)';
    return 'var(--danger)';
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);
  };

  const handleAcceptContract = (contract) => {
    if (!selectedPlayer) return;

    const updatedRoster = roster.map(p => {
      if (p.id === selectedPlayer.id) {
        return {
          ...p,
          contract,
        };
      }
      return p;
    });

    updateRoster(gameState.userTeamId, updatedRoster);
    alert(`${selectedPlayer.fullName} has accepted your offer!\n\n${contract.years} years, ${formatSalary(contract.salary)}/year`);
    setSelectedPlayer(null);
  };

  const salaryCap = 200000000;
  const currentSalary = roster.reduce((sum, p) => sum + (p.contract?.salary || 0), 0);
  const availableCap = salaryCap - currentSalary;

  return (
    <div className="container">
      {selectedPlayer && (
        <ContractModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onAccept={handleAcceptContract}
          availableCap={availableCap}
        />
      )}
      
      <h1 className="mb-2">Contract Negotiations</h1>
      <p className="text-muted mb-3">Negotiate extensions with players entering their final contract years</p>

      <div className="card mb-2">
        <div className="card-header">Salary Cap</div>
        <div className="flex-between">
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
              {formatSalary(availableCap)}
            </div>
            <div className="text-muted">Available</div>
          </div>
          <div className="text-right">
            <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              {formatSalary(currentSalary)}
            </div>
            <div className="text-muted">Current / {formatSalary(salaryCap)}</div>
          </div>
        </div>
      </div>

      {eligiblePlayers.length === 0 ? (
        <div className="card">
          <div className="text-center" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3>No Players Need Extensions</h3>
            <p className="text-muted">All your players have 3+ years remaining on their contracts.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="card mb-2">
            <div className="card-header">
              Players Eligible for Extension ({eligiblePlayers.length})
            </div>
            <ul className="list">
              {eligiblePlayers.map(player => {
                const marketValue = calculateMarketValue(player);
                const needsUrgent = player.contract.yearsLeft === 1;
                
                return (
                  <li 
                    key={player.id} 
                    className="list-item"
                    onClick={() => handleSelectPlayer(player)}
                    style={{ 
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                          {player.fullName}
                        </span>
                        {needsUrgent && (
                          <span className="badge badge-danger">URGENT</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-info">{player.position}</span>
                        <span className="text-muted">Age: {player.age}</span>
                        <span className="text-muted">{player.contract.yearsLeft}y left</span>
                        <span className="text-muted">Current: {formatSalary(player.contract.salary)}</span>
                        <span style={{ color: 'var(--success)' }}>Market: {formatSalary(calculateMarketValue(player))}</span>
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700',
                      color: getRatingColor(player.overall)
                    }}>
                      {player.overall}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function calculateMarketValue(player) {
  // Calculate market value based on overall, age, position
  const baseValue = (player.overall - 50) * 200000 + 2000000;
  const ageFactor = player.age < 30 ? 1.2 : player.age < 33 ? 1.0 : 0.8;
  const positionMultiplier = ['QB', 'LT', 'DE', 'CB'].includes(player.position) ? 1.3 : 1.0;
  
  return Math.floor(baseValue * ageFactor * positionMultiplier);
}
