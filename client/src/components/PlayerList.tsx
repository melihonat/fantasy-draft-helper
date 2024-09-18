import React from 'react';
import { Player } from '../services/api';

interface PlayerListProps {
  players: Player[];
  onDraft: (player: Player) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, onDraft }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-nfl-blue bg-opacity-50">
            <th className="p-2 text-nfl-white font-semibold">Name</th>
            <th className="p-2 text-nfl-white font-semibold">Position</th>
            <th className="p-2 text-nfl-white font-semibold">Team</th>
            <th className="p-2 text-nfl-white font-semibold">ADP</th>
            <th className="p-2 text-nfl-white font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.player_id} className="border-b border-nfl-gray border-opacity-20 hover:bg-nfl-blue hover:bg-opacity-25 transition-colors duration-150">
              <td className="p-2 font-medium">{player.full_name}</td>
              <td className="p-2">{player.position}</td>
              <td className="p-2">{player.team}</td>
              <td className="p-2 text-nfl-red">{player.adp.toFixed(1)}</td>
              <td className="p-2">
                <button
                  onClick={() => onDraft(player)}
                  className="bg-nfl-red hover:bg-red-700 text-nfl-white font-bold py-1 px-3 rounded-full text-sm transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  Draft
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerList;