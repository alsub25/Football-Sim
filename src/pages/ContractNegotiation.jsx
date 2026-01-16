import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';

export default function ContractNegotiation() {
  const { gameState, updateRoster } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [offerYears, setOfferYears] = useState(3);
  const [offerSalary, setOfferSalary] = useState(0);

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

  const calculateMarketValue = (player) => {
    // Calculate market value based on overall, age, position
    const baseValue = (player.overall - 50) * 200000 + 2000000;
    const ageFactor = player.age < 30 ? 1.2 : player.age < 33 ? 1.0 : 0.8;
    const positionMultiplier = ['QB', 'LT', 'DE', 'CB'].includes(player.position) ? 1.3 : 1.0;
    
    return Math.floor(baseValue * ageFactor * positionMultiplier);
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);
    const marketValue = calculateMarketValue(player);
    setOfferSalary(marketValue);
    setOfferYears(3);
  };

  const handleNegotiate = () => {
    if (!selectedPlayer) return;

    const marketValue = calculateMarketValue(selectedPlayer);
    const offerRatio = offerSalary / marketValue;
    
    // Simple acceptance logic - using deterministic approach
    let accepted = false;
    const playerIdHash = selectedPlayer.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomSeed = (playerIdHash + offerSalary + offerYears) % 100;
    
    if (offerRatio >= 1.1) {
      accepted = true; // Happy to accept
    } else if (offerRatio >= 0.9) {
      accepted = randomSeed > 30; // 70% chance
    } else if (offerRatio >= 0.75) {
      accepted = randomSeed > 60; // 40% chance
    } else {
      accepted = randomSeed > 90; // 10% chance
    }

    if (accepted) {
      // Update player contract
      const updatedRoster = roster.map(p => {
        if (p.id === selectedPlayer.id) {
          const signingBonus = offerSalary * offerYears * 0.3;
          const guaranteedYears = Math.min(Math.ceil(offerYears * 0.6), offerYears);
          
          return {
            ...p,
            contract: {
              ...p.contract,
              years: offerYears,
              yearsLeft: offerYears,
              salary: offerSalary,
              signingBonus,
              guaranteedMoney: offerSalary * guaranteedYears + signingBonus,
              type: 'Extension',
            }
          };
        }
        return p;
      });

      updateRoster(gameState.userTeamId, updatedRoster);
      alert(`${selectedPlayer.fullName} has accepted your offer!\n\n${offerYears} years, ${formatSalary(offerSalary)}/year`);
      setSelectedPlayer(null);
    } else {
      alert(`${selectedPlayer.fullName} has rejected your offer.\n\nThey are looking for around ${formatSalary(marketValue)}/year.`);
    }
  };

  const salaryCap = 200000000;
  const currentSalary = roster.reduce((sum, p) => sum + (p.contract?.salary || 0), 0);
  const availableCap = salaryCap - currentSalary;

  return (
    <div className="container">
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
                      background: selectedPlayer?.id === player.id ? 'var(--surface-light)' : 'transparent'
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
                        <span style={{ color: 'var(--success)' }}>Market: {formatSalary(marketValue)}</span>
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

          {selectedPlayer && (
            <div className="card">
              <div className="card-header">
                Negotiate with {selectedPlayer.fullName}
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label>Contract Length (Years)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map(years => (
                      <button
                        key={years}
                        className={offerYears === years ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setOfferYears(years)}
                        style={{ flex: 1 }}
                      >
                        {years}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label>Annual Salary</label>
                  <input
                    type="range"
                    min={Math.floor(calculateMarketValue(selectedPlayer) * 0.5)}
                    max={Math.floor(calculateMarketValue(selectedPlayer) * 1.5)}
                    step={100000}
                    value={offerSalary}
                    onChange={(e) => setOfferSalary(parseInt(e.target.value))}
                  />
                  <div className="flex-between" style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                      {formatSalary(offerSalary)}
                    </span>
                    <span className="text-muted">
                      per year
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--surface-light)', borderRadius: '8px' }}>
                  <div className="flex-between mb-1">
                    <span className="text-muted">Total Contract Value</span>
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                      {formatSalary(offerSalary * offerYears)}
                    </span>
                  </div>
                  <div className="flex-between mb-1">
                    <span className="text-muted">Signing Bonus (30%)</span>
                    <span style={{ fontWeight: '600' }}>
                      {formatSalary(offerSalary * offerYears * 0.3)}
                    </span>
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">Guaranteed Money (60%)</span>
                    <span style={{ fontWeight: '600', color: 'var(--success)' }}>
                      {formatSalary(offerSalary * Math.ceil(offerYears * 0.6) + offerSalary * offerYears * 0.3)}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--info)', color: 'white', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Market Comparison</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    Market Value: {formatSalary(calculateMarketValue(selectedPlayer))} per year
                    {offerSalary > calculateMarketValue(selectedPlayer) * 1.1 && (
                      <div>✅ This is a very competitive offer</div>
                    )}
                    {offerSalary >= calculateMarketValue(selectedPlayer) * 0.9 && offerSalary <= calculateMarketValue(selectedPlayer) * 1.1 && (
                      <div>💼 This is a fair market offer</div>
                    )}
                    {offerSalary < calculateMarketValue(selectedPlayer) * 0.9 && (
                      <div>⚠️ This may be below market value</div>
                    )}
                  </div>
                </div>

                <button 
                  className="btn-primary"
                  onClick={handleNegotiate}
                  disabled={offerSalary > availableCap}
                >
                  {offerSalary > availableCap ? 'Insufficient Cap Space' : 'Make Offer'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
