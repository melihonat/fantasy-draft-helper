import React from 'react';
import { Player, DraftState, LeagueSettings } from '../services/api';

interface DraftOverviewProps {
  draftState: DraftState;
  leagueSettings: LeagueSettings;
}

interface TeamOverview {
  id: number;
  name: string;
  players: Player[];
  averageADP: number;
}

const DraftOverview: React.FC<DraftOverviewProps> = ({ draftState, leagueSettings }) => {
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
      <h2 className="text-3xl font-bold mb-6 text-center">Draft Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamOverviews.map((team, index) => (
          <div key={team.id} className="team-card bg-nfl-gray bg-opacity-20 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-2">
              {index + 1}. {team.name}
            </h3>
            <p className="text-sm mb-2">Average ADP: {team.averageADP.toFixed(2)}</p>
            <ul className="space-y-1">
              {team.players.map(player => (
                <li key={player.player_id} className="text-sm">
                  {player.full_name} ({player.position} - {player.team}) - ADP: {player.adp.toFixed(1)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftOverview;