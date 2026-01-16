import React from 'react';
import { useGame } from '../hooks/useGame';
import { getTeamById } from '../data/teams';
import { calculateCareerStats } from '../data/seasonHistory';

export default function History() {
  const { gameState } = useGame();
  const userTeam = getTeamById(gameState.userTeamId);
  const history = gameState.seasonHistory || [];
  
  const careerStats = history.length > 0 ? calculateCareerStats(history) : null;
  
  return (
    <div className="container">
      <div className="flex-between mb-2">
        <div>
          <h1>Season History</h1>
          <p className="text-muted">{userTeam?.name}</p>
        </div>
        {careerStats && (
          <div className="text-right">
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {history.length}
            </div>
            <div className="text-muted">Seasons</div>
          </div>
        )}
      </div>
      
      {careerStats && (
        <div className="card mb-2">
          <div className="card-header">Career Summary</div>
          <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Overall Record</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {careerStats.totalWins}-{careerStats.totalLosses}-{careerStats.totalTies}
              </div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Win Percentage</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {((careerStats.totalWins / (careerStats.totalWins + careerStats.totalLosses + careerStats.totalTies)) * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Playoff Appearances</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {careerStats.playoffAppearances}
              </div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Championships</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                {careerStats.championships} 🏆
              </div>
            </div>
          </div>
        </div>
      )}
      
      {history.length === 0 ? (
        <div className="card">
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h2>No History Yet</h2>
            <p className="text-muted">Complete your first season to see history here.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">Season by Season</div>
          <div>
            {[...history].reverse().map((season) => (
              <div key={season.season} className="list-item">
                <div className="flex-between mb-1">
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                      {season.season} Season
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                      {season.record.wins}-{season.record.losses}-{season.record.ties}
                    </div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontWeight: '600' }}>
                      {season.playoffResult}
                    </div>
                    {season.playoffSeed && (
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        #{season.playoffSeed} seed
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-between" style={{ fontSize: '0.875rem' }}>
                  <span className="text-muted">Points For: {season.record.pointsFor}</span>
                  <span className="text-muted">Points Against: {season.record.pointsAgainst}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
