import React from 'react';
import { Player } from '../services/api';

interface PlayerListProps {
  players: Player[];
  onDraft: (player: Player) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, onDraft }) => {
  return (
    <div>
      <h2>Available Players</h2>
      <table>
        <thead>
          <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Position</th>
              <th>Team</th>
              <th>ADP</th>
              <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.player_id}>
              <td>{player.rank}</td>
              <td>{player.full_name}</td>
              <td>{player.position}</td>
              <td>{player.team}</td>
              <td>{player.adp.toFixed(1)}</td>
              <td>
                <button onClick={() => onDraft(player)}>Draft</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerList;
