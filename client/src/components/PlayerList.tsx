import React from 'react';
import { Player } from '../services/api';

interface PlayerListProps {
  players: Player[];
  onDraft: (player: Player) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, onDraft }) => {
  return (
    <div className="player-list">
      <h2>Available Players</h2>
      <ul>
        {players.map(player => (
          <li key={player.player_id}>
            {player.full_name} ({player.position} - {player.team})
            <button onClick={() => onDraft(player)}>Draft</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;