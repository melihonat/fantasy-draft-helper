import React from 'react';
import { DraftState, Player } from '../services/api';

interface DraftBoardProps {
  draftState: DraftState;
}

const DraftBoard: React.FC<DraftBoardProps> = ({ draftState }) => {
  return (
    <div className="draft-board">
      <h2>Draft Board</h2>
      {draftState.teams.map((team) => (
        <div key={team.id} className="team-draft">
          <h3>Team {team.id}</h3>
          <ul>
            {team.players.map((player: Player) => (
              <li key={player.player_id}>
                {player.full_name} ({player.position} - {player.team}) ADP: {player.adp.toFixed(1)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DraftBoard;