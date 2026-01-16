import React from 'react';
import { useGame } from '../hooks/useGame';
import { getTeamById } from '../data/teams';

export default function Dashboard({ setCurrentPage }) {
  const { gameState, advanceWeek, advanceToNextSeason } = useGame();
  const team = getTeamById(gameState.userTeamId);
  const standings = gameState.standings[gameState.userTeamId] || { wins: 0, losses: 0, ties: 0 };
  const roster = gameState.rosters[gameState.userTeamId] || [];
  const seasonPhase = gameState.seasonPhase;

  const weekGames = gameState.schedule.filter(
    game => game.week === gameState.currentWeek && game.season === gameState.currentSeason
  );

  const userGame = weekGames.find(
    game => game.homeTeam === gameState.userTeamId || game.awayTeam === gameState.userTeamId
  );

  const recentResults = gameState.gameResults
    .filter(game => game.homeTeam === gameState.userTeamId || game.awayTeam === gameState.userTeamId)
    .slice(-5)
    .reverse();
  
  // Get injured players count
  const injuredPlayers = roster.filter(p => p.injury && p.injury.weeksRemaining > 0).length;

  return (
    <div className="container">
      <div className="flex-between mb-3">
        <div>
          <h1>{team?.name}</h1>
          <p className="text-muted">
            {seasonPhase === 'draft' && 'Draft'}
            {seasonPhase === 'freeAgency' && 'Free Agency'}
            {seasonPhase === 'regular' && `Week ${gameState.currentWeek}`}
            {seasonPhase === 'playoffs' && 'Playoffs'}
            {seasonPhase === 'offseason' && 'Offseason'}
            {' · '}{gameState.currentSeason} Season
          </p>
        </div>
        <div className="text-right">
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {standings.wins}-{standings.losses}-{standings.ties}
          </div>
          <div className="text-muted">Record</div>
        </div>
      </div>
      
      {seasonPhase === 'draft' && (
        <div className="card mb-2" style={{ background: 'var(--secondary-color)' }}>
          <div className="card-header">🎯 Draft Time!</div>
          <div style={{ padding: '1rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              The {gameState.currentSeason} NFL Draft is ready. Select your prospects wisely!
            </p>
            <button 
              className="btn-primary"
              onClick={() => setCurrentPage('draft')}
              style={{ width: '100%' }}
            >
              Go to Draft
            </button>
          </div>
        </div>
      )}
      
      {seasonPhase === 'freeAgency' && (
        <div className="card mb-2" style={{ background: 'var(--secondary-color)' }}>
          <div className="card-header">✍️ Free Agency Period</div>
          <div style={{ padding: '1rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              Sign free agents to improve your roster before the season starts.
            </p>
            <button 
              className="btn-primary"
              onClick={() => setCurrentPage('freeagency')}
              style={{ width: '100%' }}
            >
              Go to Free Agency
            </button>
          </div>
        </div>
      )}
      
      {seasonPhase === 'offseason' && (
        <div className="card mb-2" style={{ background: 'var(--secondary-color)' }}>
          <div className="card-header">Season Complete!</div>
          <div style={{ padding: '1rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              The {gameState.currentSeason} season is complete. Advance to the next season.
            </p>
            <button 
              className="btn-primary"
              onClick={advanceToNextSeason}
              style={{ width: '100%' }}
            >
              Advance to Next Season
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-2 mb-2">
        <div className="card">
          <div className="card-header">Team Stats</div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div className="flex-between">
              <span className="text-muted">Points For</span>
              <span style={{ fontWeight: '600' }}>{standings.pointsFor}</span>
            </div>
            <div className="flex-between">
              <span className="text-muted">Points Against</span>
              <span style={{ fontWeight: '600' }}>{standings.pointsAgainst}</span>
            </div>
            <div className="flex-between">
              <span className="text-muted">Point Diff</span>
              <span style={{ 
                fontWeight: '600',
                color: standings.pointsFor - standings.pointsAgainst > 0 ? 'var(--success)' : 'var(--danger)'
              }}>
                {standings.pointsFor - standings.pointsAgainst > 0 ? '+' : ''}
                {standings.pointsFor - standings.pointsAgainst}
              </span>
            </div>
            <div className="flex-between">
              <span className="text-muted">Roster Size</span>
              <span style={{ fontWeight: '600' }}>{roster.length}/53</span>
            </div>
            <div className="flex-between">
              <span className="text-muted">Injuries</span>
              <span style={{ fontWeight: '600', color: injuredPlayers > 0 ? 'var(--danger)' : 'var(--success)' }}>
                {injuredPlayers}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Your Role</div>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              {gameState.userRole === 'GM' ? '👔' : '🎯'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {gameState.userRole === 'GM' ? 'General Manager' : 'Head Coach'}
            </div>
            <div className="text-muted">
              {gameState.userRole === 'GM' 
                ? 'Build your championship roster' 
                : 'Lead your team to victory'}
            </div>
          </div>
        </div>
      </div>

      {(seasonPhase === 'regular' || seasonPhase === 'playoffs') && userGame && !userGame.played && (
        <div className="card mb-2" style={{ background: 'var(--secondary-color)' }}>
          <div className="card-header">This Week's Matchup</div>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              {userGame.awayTeam === gameState.userTeamId ? '@ ' : 'vs '}
              {getTeamById(userGame.homeTeam === gameState.userTeamId ? userGame.awayTeam : userGame.homeTeam)?.name}
            </div>
            <button 
              className="btn-primary" 
              onClick={advanceWeek}
              style={{ marginTop: '0.5rem' }}
            >
              Simulate Week {gameState.currentWeek}
            </button>
          </div>
        </div>
      )}

      {recentResults.length > 0 && (
        <div className="card">
          <div className="card-header">Recent Results</div>
          <ul className="list">
            {recentResults.map(game => {
              const isHome = game.homeTeam === gameState.userTeamId;
              const opponent = getTeamById(isHome ? game.awayTeam : game.homeTeam);
              const userScore = isHome ? game.homeScore : game.awayScore;
              const oppScore = isHome ? game.awayScore : game.homeScore;
              const won = userScore > oppScore;

              return (
                <li key={game.id} className="list-item">
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      Week {game.week}: {isHome ? 'vs' : '@'} {opponent?.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                      {userScore} - {oppScore}
                    </div>
                  </div>
                  <span className={`badge ${won ? 'badge-success' : 'badge-danger'}`}>
                    {won ? 'W' : 'L'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
