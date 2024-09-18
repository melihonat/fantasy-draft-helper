import React from 'react';
import { Player, DraftState, LeagueSettings } from '../services/api';

interface DraftOverviewProps {
  draftState: DraftState;
  leagueSettings: LeagueSettings;
  onNewDraft: () => void;
}

interface TeamOverview {
  id: number;
  name: string;
  players: Player[];
  averageADP: number;
}

const DraftOverview: React.FC<DraftOverviewProps> = ({ draftState, leagueSettings, onNewDraft }) => {
  const getTeamOverviews = (): TeamOverview[] => {
    return draftState.teams.map(team => ({
      id: team.id,
      name: leagueSettings.teamNames[team.id - 1],
      players: team.players,
      averageADP: team.players.reduce((sum, player) => sum + player.adp, 0) / team.players.length
    })).sort((a, b) => a.averageADP - b.averageADP);
  };

  const teamOverviews = getTeamOverviews();

  return (
    <div className="draft-overview min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-red text-nfl-white p-6 md:p-12">
      <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center text-nfl-white drop-shadow-lg">Draft Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamOverviews.map((team, index) => (
          <div key={team.id} className="team-card bg-white bg-opacity-10 p-6 rounded-lg shadow-lg backdrop-filter backdrop-blur-sm border border-white border-opacity-20 transition-all duration-300 hover:bg-opacity-20">
            <h3 className="text-xl font-bold mb-4 flex justify-between items-center">
              <span className="text-nfl-white">{index + 1}. {team.name}</span>
              <span className="text-sm font-normal text-nfl-red">ADP: {team.averageADP.toFixed(2)}</span>
            </h3>
            <ul className="space-y-2 text-sm max-h-64 overflow-y-auto pr-2">
              {team.players.map(player => (
                <li key={player.player_id} className="flex justify-between items-center bg-nfl-blue bg-opacity-30 rounded p-2">
                  <span className="font-medium">{player.full_name} ({player.position})</span>
                  <span className="text-nfl-gray">ADP: {player.adp.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <button
          onClick={onNewDraft}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 shadow-lg"
        >
          Start New Draft
        </button>
      </div>
    </div>
  );
};

export default DraftOverview;