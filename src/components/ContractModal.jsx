import React, { useState } from 'react';
import { calculateMarketValue, calculateGuaranteedMoney } from '../utils/contractUtils';

export default function ContractModal({ player, onClose, onAccept, availableCap }) {
  const [offerYears, setOfferYears] = useState(3);
  const [offerSalary, setOfferSalary] = useState(() => calculateMarketValue(player));
  const [signingBonusPercent, setSigningBonusPercent] = useState(30);
  const [guaranteedPercent, setGuaranteedPercent] = useState(60);
  const [includeNoTrade, setIncludeNoTrade] = useState(false);
  const [includeNoFranchise, setIncludeNoFranchise] = useState(false);
  const [performanceBonuses, setPerformanceBonuses] = useState({
    proBowl: 0,
    allPro: 0,
    playoffAppearance: 0,
  });
  const [milestoneBonuses, setMilestoneBonuses] = useState({
    yards1000: 0,
    touchdowns10: 0,
    sacks10: 0,
  });

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

  const marketValue = calculateMarketValue(player);
  const totalContractValue = offerSalary * offerYears;
  const signingBonus = Math.floor(totalContractValue * (signingBonusPercent / 100));
  const guaranteedMoney = calculateGuaranteedMoney(offerSalary, offerYears, signingBonus, guaranteedPercent);
  const totalBonuses = Object.values(performanceBonuses).reduce((sum, val) => sum + val, 0) +
                       Object.values(milestoneBonuses).reduce((sum, val) => sum + val, 0);
  const maxContractValue = totalContractValue + totalBonuses;

  const handleMakeOffer = () => {
    const offerRatio = offerSalary / marketValue;
    
    // Simple acceptance logic
    let accepted = false;
    const playerIdHash = player.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomSeed = (playerIdHash + offerSalary + offerYears) % 100;
    
    // Higher guarantees and bonuses increase acceptance chance
    const guaranteeBonus = (guaranteedPercent - 50) / 100; // +0.1 for 60%, +0.2 for 70%
    const clauseBonus = (includeNoTrade ? 0.05 : 0) + (includeNoFranchise ? 0.05 : 0);
    const bonusBonus = totalBonuses > 0 ? 0.05 : 0;
    
    const adjustedRatio = offerRatio + guaranteeBonus + clauseBonus + bonusBonus;
    
    if (adjustedRatio >= 1.1) {
      accepted = true; // Happy to accept
    } else if (adjustedRatio >= 0.9) {
      accepted = randomSeed > 30; // 70% chance
    } else if (adjustedRatio >= 0.75) {
      accepted = randomSeed > 60; // 40% chance
    } else {
      accepted = randomSeed > 90; // 10% chance
    }

    if (accepted) {
      const contract = {
        years: offerYears,
        yearsLeft: offerYears,
        salary: offerSalary,
        signingBonus,
        guaranteedMoney,
        type: player.contract ? 'Extension' : 'Free Agent',
        bonuses: {
          performance: performanceBonuses,
          milestones: milestoneBonuses,
        },
        clauses: {
          noTrade: includeNoTrade,
          noFranchiseTag: includeNoFranchise,
        },
      };
      onAccept(contract);
    } else {
      alert(`${player.fullName} has rejected your offer.\n\nThey are looking for around ${formatSalary(marketValue)}/year with better guarantees or incentives.`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>Contract Offer</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '600' }}>{player.fullName}</span>
              <span className="badge badge-info">{player.position}</span>
              <span className="text-muted">Age: {player.age}</span>
              <span style={{ 
                fontWeight: '700',
                color: getRatingColor(player.overall)
              }}>
                OVR {player.overall}
              </span>
            </div>
          </div>
          <button className="btn-secondary btn-small" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Market Value */}
          <div className="card mb-2" style={{ background: 'var(--info)', color: 'white' }}>
            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                Market Value
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {formatSalary(marketValue)} per year
              </div>
            </div>
          </div>

          {/* Contract Length */}
          <div className="card mb-2">
            <div className="card-header">Contract Length</div>
            <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem' }}>
              {[1, 2, 3, 4, 5].map(years => (
                <button
                  key={years}
                  className={offerYears === years ? 'btn-primary btn-small' : 'btn-secondary btn-small'}
                  onClick={() => setOfferYears(years)}
                  style={{ flex: 1 }}
                >
                  {years} yr{years > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Base Salary */}
          <div className="card mb-2">
            <div className="card-header">Annual Base Salary</div>
            <div style={{ padding: '1rem' }}>
              <input
                type="range"
                min={Math.floor(marketValue * 0.5)}
                max={Math.floor(marketValue * 1.5)}
                step={100000}
                value={offerSalary}
                onChange={(e) => setOfferSalary(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
              <div className="flex-between" style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                  {formatSalary(offerSalary)}
                </span>
                <span className="text-muted">per year</span>
              </div>
            </div>
          </div>

          {/* Signing Bonus */}
          <div className="card mb-2">
            <div className="card-header">Signing Bonus</div>
            <div style={{ padding: '1rem' }}>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={signingBonusPercent}
                onChange={(e) => setSigningBonusPercent(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
              <div className="flex-between" style={{ marginTop: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>
                  {signingBonusPercent}% of total value
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>
                  {formatSalary(signingBonus)}
                </span>
              </div>
            </div>
          </div>

          {/* Guaranteed Money */}
          <div className="card mb-2">
            <div className="card-header">Guaranteed Money</div>
            <div style={{ padding: '1rem' }}>
              <input
                type="range"
                min={40}
                max={100}
                step={10}
                value={guaranteedPercent}
                onChange={(e) => setGuaranteedPercent(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
              <div className="flex-between" style={{ marginTop: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>
                  {guaranteedPercent}% of contract
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>
                  {formatSalary(guaranteedMoney)}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Bonuses */}
          <div className="card mb-2">
            <div className="card-header">Performance Bonuses (Optional)</div>
            <div style={{ padding: '1rem', display: 'grid', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'block' }}>
                  Pro Bowl Selection
                </label>
                <input
                  type="number"
                  min={0}
                  max={2000000}
                  step={50000}
                  value={performanceBonuses.proBowl}
                  onChange={(e) => setPerformanceBonuses({ ...performanceBonuses, proBowl: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  style={{ width: '100%' }}
                />
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {formatSalary(performanceBonuses.proBowl)}
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'block' }}>
                  All-Pro Selection
                </label>
                <input
                  type="number"
                  min={0}
                  max={3000000}
                  step={50000}
                  value={performanceBonuses.allPro}
                  onChange={(e) => setPerformanceBonuses({ ...performanceBonuses, allPro: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  style={{ width: '100%' }}
                />
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {formatSalary(performanceBonuses.allPro)}
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'block' }}>
                  Playoff Appearance
                </label>
                <input
                  type="number"
                  min={0}
                  max={1000000}
                  step={50000}
                  value={performanceBonuses.playoffAppearance}
                  onChange={(e) => setPerformanceBonuses({ ...performanceBonuses, playoffAppearance: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  style={{ width: '100%' }}
                />
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {formatSalary(performanceBonuses.playoffAppearance)}
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Bonuses */}
          <div className="card mb-2">
            <div className="card-header">Milestone Bonuses (Optional)</div>
            <div style={{ padding: '1rem', display: 'grid', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'block' }}>
                  1,000+ Yards (QB/RB/WR/TE)
                </label>
                <input
                  type="number"
                  min={0}
                  max={2000000}
                  step={50000}
                  value={milestoneBonuses.yards1000}
                  onChange={(e) => setMilestoneBonuses({ ...milestoneBonuses, yards1000: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  style={{ width: '100%' }}
                />
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {formatSalary(milestoneBonuses.yards1000)}
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'block' }}>
                  10+ Touchdowns/Sacks
                </label>
                <input
                  type="number"
                  min={0}
                  max={2000000}
                  step={50000}
                  value={milestoneBonuses.touchdowns10}
                  onChange={(e) => setMilestoneBonuses({ ...milestoneBonuses, touchdowns10: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  style={{ width: '100%' }}
                />
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {formatSalary(milestoneBonuses.touchdowns10)}
                </div>
              </div>
            </div>
          </div>

          {/* Contract Clauses */}
          <div className="card mb-2">
            <div className="card-header">Contract Clauses</div>
            <div style={{ padding: '1rem', display: 'grid', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeNoTrade}
                  onChange={(e) => setIncludeNoTrade(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <div>
                  <div style={{ fontWeight: '600' }}>No-Trade Clause</div>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Player cannot be traded without consent
                  </div>
                </div>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeNoFranchise}
                  onChange={(e) => setIncludeNoFranchise(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <div>
                  <div style={{ fontWeight: '600' }}>No-Franchise Tag</div>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Team cannot use franchise tag on player
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Contract Summary */}
          <div className="card" style={{ background: 'var(--surface-light)' }}>
            <div className="card-header">Contract Summary</div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div className="flex-between">
                <span className="text-muted">Total Contract Value</span>
                <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>
                  {formatSalary(totalContractValue)}
                </span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Signing Bonus</span>
                <span style={{ fontWeight: '600' }}>
                  {formatSalary(signingBonus)}
                </span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Guaranteed Money</span>
                <span style={{ fontWeight: '600', color: 'var(--success)' }}>
                  {formatSalary(guaranteedMoney)}
                </span>
              </div>
              {totalBonuses > 0 && (
                <div className="flex-between">
                  <span className="text-muted">Potential Bonuses</span>
                  <span style={{ fontWeight: '600', color: 'var(--info)' }}>
                    {formatSalary(totalBonuses)}
                  </span>
                </div>
              )}
              <div className="flex-between" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontWeight: '600' }}>Max Total Value</span>
                <span style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--primary-color)' }}>
                  {formatSalary(maxContractValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Comparison to Market */}
          <div className="card mb-2" style={{ 
            background: offerSalary >= marketValue * 1.1 ? 'var(--success)' : 
                        offerSalary >= marketValue * 0.9 ? 'var(--info)' : 'var(--warning)',
            color: 'white',
            marginTop: '1rem'
          }}>
            <div style={{ padding: '1rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Market Comparison</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {offerSalary > marketValue * 1.1 && '✅ This is a very competitive offer that will likely be accepted'}
                {offerSalary >= marketValue * 0.9 && offerSalary <= marketValue * 1.1 && '💼 This is a fair market offer with reasonable acceptance chance'}
                {offerSalary < marketValue * 0.9 && '⚠️ This may be below market value and could be rejected'}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-primary"
            onClick={handleMakeOffer}
            disabled={offerSalary > availableCap}
          >
            {offerSalary > availableCap ? 'Insufficient Cap Space' : 'Make Offer'}
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
