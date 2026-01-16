import React from 'react';
import { useGame } from '../hooks/useGame';
import { getTeamById } from '../data/teams';

export default function Standings() {
  const { gameState } = useGame();
  
  const divisions = [
    { conf: 'AFC', div: 'East' },
    { conf: 'AFC', div: 'North' },
    { conf: 'AFC', div: 'South' },
    { conf: 'AFC', div: 'West' },
    { conf: 'NFC', div: 'East' },
    { conf: 'NFC', div: 'North' },
    { conf: 'NFC', div: 'South' },
    { conf: 'NFC', div: 'West' },
  ];

  const getDivisionStandings = (conf, div) => {
    const teams = Object.keys(gameState.standings)
      .map(teamId => ({
        ...getTeamById(teamId),
        ...gameState.standings[teamId],
      }))
      .filter(team => team.conference === conf && team.division === div)
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.losses !== a.losses) return a.losses - b.losses;
        return b.pointsFor - a.pointsFor;
      });
    
    return teams;
  };

  const getWinPercentage = (wins, losses, ties) => {
    const total = wins + losses + ties;
    if (total === 0) return '.000';
    return ((wins + ties * 0.5) / total).toFixed(3).substring(1);
  };

  return (
    <div className="container">
      <h1 className="mb-3">NFL Standings</h1>
      <p className="text-muted mb-3">Week {gameState.currentWeek} · {gameState.currentSeason} Season</p>

      {['AFC', 'NFC'].map(conf => (
        <div key={conf} style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            color: 'var(--accent-color)', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '2px solid var(--accent-color)'
          }}>
            {conf}
          </h2>

          <div className="grid" style={{ gap: '1rem' }}>
            {divisions
              .filter(d => d.conf === conf)
              .map(({ conf, div }) => {
                const teams = getDivisionStandings(conf, div);
                
                return (
                  <div key={`${conf}-${div}`} className="card">
                    <div className="card-header">{conf} {div}</div>
                    <div className="table-responsive">
                      <table>
                        <thead>
                          <tr>
                            <th>Team</th>
                            <th>W</th>
                            <th>L</th>
                            <th>T</th>
                            <th>PCT</th>
                            <th>PF</th>
                            <th>PA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teams.map((team, idx) => (
                            <tr 
                              key={team.id}
                              style={{
                                background: team.id === gameState.userTeamId ? 'var(--secondary-color)' : undefined
                              }}
                            >
                              <td>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.5rem' 
                                }}>
                                  <span style={{ 
                                    width: '12px', 
                                    height: '12px', 
                                    borderRadius: '50%',
                                    background: team.colors[0],
                                    border: `2px solid ${team.colors[1] || '#fff'}`,
                                    flexShrink: 0
                                  }} />
                                  <span style={{ fontWeight: idx === 0 ? '600' : '400' }}>
                                    {team.name}
                                  </span>
                                </div>
                              </td>
                              <td style={{ fontWeight: '600' }}>{team.wins}</td>
                              <td>{team.losses}</td>
                              <td>{team.ties}</td>
                              <td>{getWinPercentage(team.wins, team.losses, team.ties)}</td>
                              <td>{team.pointsFor}</td>
                              <td>{team.pointsAgainst}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
