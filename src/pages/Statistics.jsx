import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { getTeamById } from '../data/teams';

export default function Statistics() {
  const { gameState } = useGame();
  const [tab, setTab] = useState('team'); // 'team', 'players', 'league'
  
  const userTeam = getTeamById(gameState.userTeamId);
  const userRoster = gameState.rosters[gameState.userTeamId] || [];
  const standings = gameState.standings[gameState.userTeamId] || { wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0 };
  
  // Calculate team ratings
  const teamRatings = {
    offense: Math.round(userRoster.filter(p => ['QB', 'RB', 'WR', 'TE'].includes(p.position)).reduce((sum, p) => sum + p.overall, 0) / userRoster.filter(p => ['QB', 'RB', 'WR', 'TE'].includes(p.position)).length || 70),
    defense: Math.round(userRoster.filter(p => ['DE', 'DT', 'LB', 'CB', 'S'].includes(p.position)).reduce((sum, p) => sum + p.overall, 0) / userRoster.filter(p => ['DE', 'DT', 'LB', 'CB', 'S'].includes(p.position)).length || 70),
    overall: Math.round(userRoster.reduce((sum, p) => sum + p.overall, 0) / userRoster.length || 70),
  };
  
  // Get top players by position
  const getTopPlayers = (position, limit = 5) => {
    return userRoster
      .filter(p => p.position === position)
      .sort((a, b) => b.overall - a.overall)
      .slice(0, limit);
  };
  
  const renderTeamStats = () => (
    <div>
      <div className="card mb-2">
        <div className="card-header">Team Ratings</div>
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Overall</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                {teamRatings.overall}
              </div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Offense</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--success)' }}>
                {teamRatings.offense}
              </div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Defense</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--danger)' }}>
                {teamRatings.defense}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card mb-2">
        <div className="card-header">Season Statistics</div>
        <div style={{ padding: '1rem', display: 'grid', gap: '0.5rem' }}>
          <div className="flex-between">
            <span className="text-muted">Record</span>
            <span style={{ fontWeight: '700' }}>{standings.wins}-{standings.losses}-{standings.ties}</span>
          </div>
          <div className="flex-between">
            <span className="text-muted">Points Per Game</span>
            <span style={{ fontWeight: '600' }}>
              {((standings.pointsFor / Math.max(1, standings.wins + standings.losses + standings.ties)) || 0).toFixed(1)}
            </span>
          </div>
          <div className="flex-between">
            <span className="text-muted">Points Allowed Per Game</span>
            <span style={{ fontWeight: '600' }}>
              {((standings.pointsAgainst / Math.max(1, standings.wins + standings.losses + standings.ties)) || 0).toFixed(1)}
            </span>
          </div>
          <div className="flex-between">
            <span className="text-muted">Point Differential</span>
            <span style={{ 
              fontWeight: '700',
              color: standings.pointsFor - standings.pointsAgainst > 0 ? 'var(--success)' : 'var(--danger)'
            }}>
              {standings.pointsFor - standings.pointsAgainst > 0 ? '+' : ''}
              {standings.pointsFor - standings.pointsAgainst}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderPlayerStats = () => (
    <div>
      <div className="card mb-2">
        <div className="card-header">Top Quarterbacks</div>
        <div>
          {getTopPlayers('QB', 3).map(player => (
            <div key={player.id} className="list-item">
              <div className="flex-between">
                <div>
                  <div style={{ fontWeight: '600' }}>{player.fullName}</div>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Age {player.age} · {player.experience} yrs exp
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{player.overall}</div>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>Overall</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card mb-2">
        <div className="card-header">Top Pass Catchers</div>
        <div>
          {[...getTopPlayers('WR', 2), ...getTopPlayers('TE', 1)].map(player => (
            <div key={player.id} className="list-item">
              <div className="flex-between">
                <div>
                  <div style={{ fontWeight: '600' }}>{player.fullName}</div>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                    {player.position} · Age {player.age}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{player.overall}</div>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>Overall</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card mb-2">
        <div className="card-header">Top Defenders</div>
        <div>
          {[...getTopPlayers('DE', 1), ...getTopPlayers('LB', 1), ...getTopPlayers('CB', 1)].map(player => (
            <div key={player.id} className="list-item">
              <div className="flex-between">
                <div>
                  <div style={{ fontWeight: '600' }}>{player.fullName}</div>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                    {player.position} · Age {player.age}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{player.overall}</div>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>Overall</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderLeagueStats = () => (
    <div className="card">
      <div className="card-header">League Standings</div>
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {Object.entries(gameState.standings)
          .sort(([, a], [, b]) => {
            const winPctA = a.wins / Math.max(1, a.wins + a.losses + a.ties);
            const winPctB = b.wins / Math.max(1, b.wins + b.losses + b.ties);
            if (winPctB !== winPctA) return winPctB - winPctA;
            return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
          })
          .map(([teamId, record], index) => {
            const team = getTeamById(teamId);
            const isUserTeam = teamId === gameState.userTeamId;
            return (
              <div 
                key={teamId} 
                className="list-item"
                style={{ 
                  background: isUserTeam ? 'var(--secondary-color)' : undefined,
                  fontWeight: isUserTeam ? '600' : 'normal'
                }}
              >
                <div className="flex-between">
                  <div>
                    <span style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }}>#{index + 1}</span>
                    <span>{team?.name}</span>
                  </div>
                  <div className="text-right">
                    <div style={{ fontWeight: '600' }}>
                      {record.wins}-{record.losses}-{record.ties}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {record.pointsFor} PF · {record.pointsAgainst} PA
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
  
  return (
    <div className="container">
      <div className="flex-between mb-2">
        <div>
          <h1>Statistics</h1>
          <p className="text-muted">{userTeam?.name}</p>
        </div>
      </div>
      
      <div className="card mb-2">
        <div style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn-small ${tab === 'team' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('team')}
            style={{ flex: 1 }}
          >
            Team Stats
          </button>
          <button
            className={`btn-small ${tab === 'players' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('players')}
            style={{ flex: 1 }}
          >
            Top Players
          </button>
          <button
            className={`btn-small ${tab === 'league' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('league')}
            style={{ flex: 1 }}
          >
            League
          </button>
        </div>
      </div>
      
      {tab === 'team' && renderTeamStats()}
      {tab === 'players' && renderPlayerStats()}
      {tab === 'league' && renderLeagueStats()}
    </div>
  );
}
