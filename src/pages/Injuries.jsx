import React from 'react';
import { useGame } from '../hooks/useGame';
import { getTeamById } from '../data/teams';
import { getInjuryReport } from '../data/injuries';

export default function Injuries() {
  const { gameState } = useGame();
  const userTeam = getTeamById(gameState.userTeamId);
  const userRoster = gameState.rosters[gameState.userTeamId] || [];
  
  const injuryReport = getInjuryReport(userRoster);
  
  // Group by severity
  const majorInjuries = injuryReport.filter(r => r.injury.severity === 'Major');
  const moderateInjuries = injuryReport.filter(r => r.injury.severity === 'Moderate');
  const minorInjuries = injuryReport.filter(r => r.injury.severity === 'Minor');
  
  const renderInjuryList = (injuries, title) => {
    if (injuries.length === 0) return null;
    
    return (
      <div className="card mb-2">
        <div className="card-header">{title} ({injuries.length})</div>
        <div>
          {injuries.map(({ player, injury }) => (
            <div key={player.id} className="list-item">
              <div className="flex-between">
                <div>
                  <div style={{ fontWeight: '600' }}>{player.fullName}</div>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                    {player.position} · OVR {player.overall}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ fontWeight: '600', color: 'var(--danger)' }}>
                    {injury.name}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                    {injury.weeksRemaining} {injury.weeksRemaining === 1 ? 'week' : 'weeks'} remaining
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container">
      <div className="flex-between mb-2">
        <div>
          <h1>Injury Report</h1>
          <p className="text-muted">{userTeam?.name}</p>
        </div>
        <div className="text-right">
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            {injuryReport.length}
          </div>
          <div className="text-muted">Injured</div>
        </div>
      </div>
      
      {injuryReport.length === 0 ? (
        <div className="card">
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2>No Injuries</h2>
            <p className="text-muted">Your team is healthy and ready to compete!</p>
          </div>
        </div>
      ) : (
        <>
          {renderInjuryList(majorInjuries, '🔴 Major Injuries')}
          {renderInjuryList(moderateInjuries, '🟡 Moderate Injuries')}
          {renderInjuryList(minorInjuries, '🟢 Minor Injuries')}
          
          <div className="card">
            <div className="card-header">Injury Information</div>
            <div style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Major Injuries:</strong>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Season-ending or long-term injuries (6+ weeks). Consider signing replacements.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Moderate Injuries:</strong>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Multi-week injuries (2-6 weeks). Adjust depth chart accordingly.
                </p>
              </div>
              <div>
                <strong>Minor Injuries:</strong>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Short-term injuries (1-3 weeks). Player should return soon.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
