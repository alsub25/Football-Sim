import React from 'react';
import { POSITIONS } from '../data/players';

export default function PlayerDetailModal({ player, onClose, onRelease, onNegotiate }) {
  if (!player) return null;

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

  const contract = player.contract || {};
  const attributes = player.attributes || {};
  const stats = player.stats || {};
  const injury = player.injury;
  
  // Calculate total contract value
  const totalValue = (contract.salary || 0) * (contract.yearsLeft || 0) + (contract.signingBonus || 0);
  const guaranteedRemaining = Math.min(contract.guaranteedMoney || 0, totalValue);
  
  // Check if player needs contract extension
  const needsExtension = contract.yearsLeft <= 2;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>{player.fullName}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-info">{player.position}</span>
              <span className="text-muted">#{player.jerseyNumber || Math.floor(Math.random() * 99) + 1}</span>
              <span className="text-muted">Age: {player.age}</span>
              <span className="text-muted">Exp: {player.experience}y</span>
            </div>
          </div>
          <button className="btn-secondary btn-small" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Overall Rating */}
          <div className="card mb-2">
            <div className="card-header">Overall Rating</div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '700',
                color: getRatingColor(player.overall)
              }}>
                {player.overall}
              </div>
              <div className="text-muted">Potential: {player.potential}</div>
            </div>
          </div>

          {/* Injury Status */}
          {injury && injury.weeksRemaining > 0 && (
            <div className="card mb-2" style={{ background: 'var(--danger)', color: 'white' }}>
              <div className="card-header" style={{ background: 'rgba(0,0,0,0.2)' }}>
                🏥 Injury Status
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {injury.type}
                </div>
                <div>{injury.weeksRemaining} week{injury.weeksRemaining !== 1 ? 's' : ''} remaining</div>
              </div>
            </div>
          )}

          {/* Contract Details */}
          <div className="card mb-2">
            <div className="card-header">
              Contract Details
              {needsExtension && (
                <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>
                  Extension Eligible
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div className="flex-between">
                <span className="text-muted">Annual Salary</span>
                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                  {formatSalary(contract.salary || 0)}
                </span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Years Remaining</span>
                <span style={{ fontWeight: '600' }}>
                  {contract.yearsLeft}/{contract.years}
                </span>
              </div>
              {contract.signingBonus > 0 && (
                <div className="flex-between">
                  <span className="text-muted">Signing Bonus</span>
                  <span style={{ fontWeight: '600' }}>
                    {formatSalary(contract.signingBonus)}
                  </span>
                </div>
              )}
              <div className="flex-between">
                <span className="text-muted">Total Value</span>
                <span style={{ fontWeight: '600' }}>
                  {formatSalary(totalValue)}
                </span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Guaranteed Money</span>
                <span style={{ fontWeight: '600', color: 'var(--success)' }}>
                  {formatSalary(guaranteedRemaining)}
                </span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Contract Type</span>
                <span className="badge badge-info">{contract.type}</span>
              </div>
            </div>

            {/* Performance Bonuses */}
            {contract.bonuses && (contract.bonuses.performance || contract.bonuses.milestones) && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Bonuses</div>
                {contract.bonuses.performance && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    {Object.entries(contract.bonuses.performance).map(([key, value]) => (
                      <div key={key} className="flex-between" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span className="text-muted" style={{ textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span>{formatSalary(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {contract.bonuses.milestones && Object.keys(contract.bonuses.milestones).length > 0 && (
                  <div>
                    {Object.entries(contract.bonuses.milestones).map(([key, value]) => (
                      <div key={key} className="flex-between" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span className="text-muted" style={{ textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span>{formatSalary(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contract Clauses */}
            {contract.clauses && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Contract Clauses</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {contract.clauses.noTrade && (
                    <span className="badge badge-success">No-Trade Clause</span>
                  )}
                  {contract.clauses.noFranchiseTag && (
                    <span className="badge badge-success">No-Franchise Tag</span>
                  )}
                  {!contract.clauses.noTrade && !contract.clauses.noFranchiseTag && (
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>None</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Attributes */}
          <div className="card mb-2">
            <div className="card-header">Attributes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {Object.entries(attributes).map(([key, value]) => (
                <div key={key} className="flex-between">
                  <span className="text-muted" style={{ textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span style={{ 
                    fontWeight: '600',
                    color: getRatingColor(value)
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Career Stats */}
          <div className="card mb-2">
            <div className="card-header">Career Stats</div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div className="flex-between">
                <span className="text-muted">Games Played</span>
                <span style={{ fontWeight: '600' }}>{stats.gamesPlayed || 0}</span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Games Started</span>
                <span style={{ fontWeight: '600' }}>{stats.gamesStarted || 0}</span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Position</span>
                <span style={{ fontWeight: '600' }}>
                  {POSITIONS[player.position]?.name || player.position}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {needsExtension && onNegotiate && (
            <button 
              className="btn-primary"
              onClick={() => {
                onNegotiate(player);
                onClose();
              }}
            >
              Negotiate Extension
            </button>
          )}
          {onRelease && (
            <button 
              className="btn-danger"
              onClick={() => {
                if (window.confirm(`Are you sure you want to release ${player.fullName}?`)) {
                  onRelease(player.id);
                  onClose();
                }
              }}
            >
              Release Player
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
