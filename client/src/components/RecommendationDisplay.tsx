
import React from 'react';
import { Player } from '../services/api';

interface RecommendationDisplayProps {
  recommendation: Player | null;
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendation }) => {
  if (!recommendation) {
    return <div>No recommendation available</div>;
  }

  return (
    <div className="recommendation">
      <h2>Recommended Pick</h2>
      <p>
        {recommendation.full_name} ({recommendation.position} - {recommendation.team})
      </p>
      <p>ADP: {recommendation.adp.toFixed(1)}</p>
      <p>Rank: {recommendation.rank}</p>
      {recommendation.cbs_adp && <p>CBS ADP: {recommendation.cbs_adp.toFixed(1)}</p>}
      {recommendation.sleeper_adp && <p>Sleeper ADP: {recommendation.sleeper_adp.toFixed(1)}</p>}
      {recommendation.rtsports_adp && <p>RTSports ADP: {recommendation.rtsports_adp.toFixed(1)}</p>}
    </div>
  );
};

export default RecommendationDisplay;