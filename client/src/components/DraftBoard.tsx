import React from 'react';
import { DraftState } from '../services/api';

interface DraftBoardProps {
  draftState: DraftState;
}

const DraftBoard: React.FC<DraftBoardProps> = ({ draftState }) => {
  return (
    <div className="draft-board">
      <h2>Draft Board</h2>
      {draftState.teams.map(team => (
        <div key={team.id} className="team-draft">
          <h3>Team {team.id}</h3>
          <ul>
            {team.players.map((player, index) => (
              <li key={player.player_id}>
                {index + 1}. {player.full_name} ({player.position} - {player.team})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DraftBoard;