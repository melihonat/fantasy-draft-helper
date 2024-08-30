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
    <div className="draft-overview bg-nfl-blue text-nfl-white p-6 rounded-lg shadow-lg">
      <h2 className="text-4xl font-bold mb-8 text-center">Draft Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamOverviews.map((team, index) => (
          <div key={team.id} className="team-card bg-nfl-gray bg-opacity-20 p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2 flex justify-between items-center">
              <span>{index + 1}. {team.name}</span>
              <span className="text-sm font-normal text-nfl-red">ADP: {team.averageADP.toFixed(2)}</span>
            </h3>
            <ul className="space-y-1 text-sm">
              {team.players.map(player => (
                <li key={player.player_id} className="flex justify-between items-center">
                  <span>{player.full_name} ({player.position})</span>
                  <span className="text-nfl-gray">ADP: {player.adp.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={onNewDraft}
          className="bg-nfl-red hover:bg-red-700 text-nfl-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          Start New Draft
        </button>
      </div>
    </div>
  );
};

export default DraftOverview;