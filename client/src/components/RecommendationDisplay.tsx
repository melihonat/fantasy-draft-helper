
import React from 'react';
import { Player, DraftState, LeagueSettings } from '../services/api';

interface RecommendationDisplayProps {
  recommendations: (Player & { value: number })[] | null;
  draftState: DraftState | null;
  leagueSettings: LeagueSettings | null;
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendations, draftState, leagueSettings }) => {
  if (!recommendations || !draftState) {
    return <div>No recommendation available</div>;
  }

  const lastDraftedPlayer = draftState.draftedPlayers[draftState.draftedPlayers.length - 1];
  const lastPickingTeamId = draftState.currentPick > 1 ?
    (Math.ceil((draftState.currentPick - 1) / draftState.teams.length) % 2 === 1
      ? ((draftState.currentPick - 2) % draftState.teams.length) + 1
      : draftState.teams.length - ((draftState.currentPick - 2) % draftState.teams.length))
    : draftState.teams.length;
  const lastPickingTeamName = leagueSettings?.teamNames[lastPickingTeamId - 1];

  return (
    <div className="recommendation">
      <h2 className="text-xl font-bold mb-4">Top Recommended Picks</h2>
      {recommendations.map((player, index) => (
        <div key={player.player_id} className="mb-4 p-3 bg-nfl-gray bg-opacity-10 rounded">
          <p className="font-semibold">
            {index + 1}. {player.full_name} ({player.position} - {player.team})
          </p>
          <p>Recommendation Score: {player.value.toFixed(1)}%</p>
          <p>ADP: {player.adp.toFixed(1)}</p>
          {player.cbs_adp && <p>CBS ADP: {player.cbs_adp.toFixed(1)}</p>}
          {player.sleeper_adp && <p>Sleeper ADP: {player.sleeper_adp.toFixed(1)}</p>}
          {player.rtsports_adp && <p>RTSports ADP: {player.rtsports_adp.toFixed(1)}</p>}
        </div>
      ))}
      
      <h3 className="text-lg font-bold mt-4 mb-2">Last Drafted Player</h3>
      {lastDraftedPlayer && (
        <div className="p-3 bg-nfl-gray bg-opacity-10 rounded">
          <p>
            {lastDraftedPlayer.full_name} ({lastDraftedPlayer.position} - {lastDraftedPlayer.team})
          </p>
          <p>Drafted by {lastPickingTeamName}</p>
        </div>
      )}
      
      <p className="mt-4">Current Pick: {draftState.currentPick}</p>
    </div>
  );
};

export default RecommendationDisplay;