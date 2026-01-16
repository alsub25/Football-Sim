import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { getTeamById } from '../data/teams';
import { generateAvailableCoaches, COACH_POSITIONS } from '../data/coaches';

export default function Coaching() {
  const { gameState, setGameState } = useGame();
  const [hiringPosition, setHiringPosition] = useState(null);
  const [availableCoaches, setAvailableCoaches] = useState([]);
  
  const userTeam = getTeamById(gameState.userTeamId);
  const coachingStaff = gameState.coachingStaffs?.[gameState.userTeamId] || {};
  
  const isGM = gameState.userRole === 'GM';
  
  const startHiring = (position) => {
    const coaches = generateAvailableCoaches(position, 10);
    setAvailableCoaches(coaches);
    setHiringPosition(position);
  };
  
  const hireCoach = (coach) => {
    const newCoachingStaffs = {
      ...gameState.coachingStaffs,
      [gameState.userTeamId]: {
        ...coachingStaff,
        [hiringPosition]: {
          ...coach,
          teamId: gameState.userTeamId,
          position: hiringPosition,
        },
      },
    };
    
    setGameState(prev => ({
      ...prev,
      coachingStaffs: newCoachingStaffs,
    }));
    
    setHiringPosition(null);
    setAvailableCoaches([]);
  };
  
  const fireCoach = (position) => {
    if (!window.confirm(`Are you sure you want to fire your ${COACH_POSITIONS[position]}?`)) {
      return;
    }
    
    const newCoachingStaffs = {
      ...gameState.coachingStaffs,
      [gameState.userTeamId]: {
        ...coachingStaff,
      },
    };
    
    delete newCoachingStaffs[gameState.userTeamId][position];
    
    setGameState(prev => ({
      ...prev,
      coachingStaffs: newCoachingStaffs,
    }));
  };
  
  const renderCoachCard = (position, coach) => {
    const canManage = position === 'HC' ? isGM : true;
    
    return (
      <div key={position} className="card">
        <div className="card-header">{COACH_POSITIONS[position]}</div>
        {coach ? (
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              {coach.fullName}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              Age {coach.age} · {coach.experience} years experience
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div className="flex-between mb-1">
                <span className="text-muted">Offense:</span>
                <span style={{ fontWeight: '600' }}>{coach.attributes.offense}</span>
              </div>
              <div className="flex-between mb-1">
                <span className="text-muted">Defense:</span>
                <span style={{ fontWeight: '600' }}>{coach.attributes.defense}</span>
              </div>
              <div className="flex-between mb-1">
                <span className="text-muted">Motivation:</span>
                <span style={{ fontWeight: '600' }}>{coach.attributes.motivation}</span>
              </div>
              {coach.attributes.playerDevelopment && (
                <div className="flex-between">
                  <span className="text-muted">Development:</span>
                  <span style={{ fontWeight: '600' }}>{coach.attributes.playerDevelopment}</span>
                </div>
              )}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div className="flex-between mb-1">
                <span className="text-muted">Offensive Scheme:</span>
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{coach.offensiveScheme}</span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Defensive Scheme:</span>
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{coach.defensiveScheme}</span>
              </div>
            </div>
            <div className="flex-between mb-1">
              <span className="text-muted">Contract:</span>
              <span style={{ fontWeight: '600' }}>
                {coach.contract.yearsLeft} yr · ${(coach.contract.salary / 1000000).toFixed(1)}M
              </span>
            </div>
            {canManage && (
              <button 
                className="btn-danger btn-small"
                onClick={() => fireCoach(position)}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                Fire Coach
              </button>
            )}
          </div>
        ) : (
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>No coach hired</p>
            {canManage && (
              <button 
                className="btn-primary"
                onClick={() => startHiring(position)}
                style={{ width: '100%' }}
              >
                Hire {COACH_POSITIONS[position]}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };
  
  if (hiringPosition) {
    return (
      <div className="container">
        <div className="flex-between mb-2">
          <h1>Hire {COACH_POSITIONS[hiringPosition]}</h1>
          <button 
            className="btn-secondary"
            onClick={() => {
              setHiringPosition(null);
              setAvailableCoaches([]);
            }}
          >
            Cancel
          </button>
        </div>
        
        <div className="card">
          <div className="card-header">Available Candidates</div>
          <div>
            {availableCoaches.map(coach => {
              const avgRating = Math.round(
                (coach.attributes.offense + coach.attributes.defense + coach.attributes.motivation) / 3
              );
              
              return (
                <div key={coach.id} className="list-item">
                  <div className="flex-between mb-1">
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{coach.fullName}</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        Age {coach.age} · {coach.experience} years experience
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{avgRating}</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>Rating</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>OFF</div>
                      <div style={{ fontWeight: '600' }}>{coach.attributes.offense}</div>
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>DEF</div>
                      <div style={{ fontWeight: '600' }}>{coach.attributes.defense}</div>
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>MOT</div>
                      <div style={{ fontWeight: '600' }}>{coach.attributes.motivation}</div>
                    </div>
                  </div>
                  <div className="flex-between mb-1" style={{ fontSize: '0.875rem' }}>
                    <span className="text-muted">Schemes:</span>
                    <span>{coach.offensiveScheme} / {coach.defensiveScheme}</span>
                  </div>
                  <div className="flex-between mb-1" style={{ fontSize: '0.875rem' }}>
                    <span className="text-muted">Salary:</span>
                    <span style={{ fontWeight: '600' }}>${(coach.contract.salary / 1000000).toFixed(1)}M/yr</span>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => hireCoach(coach)}
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    Hire {coach.firstName} {coach.lastName}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="flex-between mb-2">
        <div>
          <h1>Coaching Staff</h1>
          <p className="text-muted">{userTeam?.name}</p>
        </div>
        <div className="text-right">
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            {Object.keys(coachingStaff).length}/4
          </div>
          <div className="text-muted">Coaches</div>
        </div>
      </div>
      
      {!isGM && (
        <div className="card mb-2" style={{ background: 'var(--secondary-color)' }}>
          <div style={{ padding: '1rem' }}>
            <strong>Head Coach Mode:</strong> You can hire and fire coordinators. 
            Only the GM can hire/fire the Head Coach.
          </div>
        </div>
      )}
      
      <div className="grid grid-2 gap-2">
        {renderCoachCard('HC', coachingStaff.HC)}
        {renderCoachCard('OC', coachingStaff.OC)}
        {renderCoachCard('DC', coachingStaff.DC)}
        {renderCoachCard('STC', coachingStaff.STC)}
      </div>
    </div>
  );
}
