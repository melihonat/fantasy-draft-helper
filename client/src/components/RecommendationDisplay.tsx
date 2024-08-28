
import React from 'react';
import { Player, DraftState } from '../services/api';

interface RecommendationDisplayProps {
  recommendation: Player | null;
  draftState: DraftState | null;
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendation, draftState }) => {
  if (!recommendation || !draftState) {
    return <div>No recommendation available</div>;
  }

  const lastDraftedPlayer = draftState.draftedPlayers[draftState.draftedPlayers.length - 1];

  return (
    <div className="recommendation">
      <h2 className="text-xl font-bold mb-4">Recommended Pick</h2>
      <p>
        {recommendation.full_name} ({recommendation.position} - {recommendation.team})
      </p>
      <p>ADP: {recommendation.adp.toFixed(1)}</p>
      {recommendation.cbs_adp && <p>CBS ADP: {recommendation.cbs_adp.toFixed(1)}</p>}
      {recommendation.sleeper_adp && <p>Sleeper ADP: {recommendation.sleeper_adp.toFixed(1)}</p>}
      {recommendation.rtsports_adp && <p>RTSports ADP: {recommendation.rtsports_adp.toFixed(1)}</p>}
      
      <h3 className="text-lg font-bold mt-4 mb-2">Last Drafted Player</h3>
      {lastDraftedPlayer && (
        <p>
          {lastDraftedPlayer.full_name} ({lastDraftedPlayer.position} - {lastDraftedPlayer.team})
        </p>
      )}
      
      <p className="mt-4">Current Pick: {draftState.currentPick}</p>
      <p>Previous Pick: {draftState.currentPick - 1}</p>
    </div>
  );
};

export default RecommendationDisplay;