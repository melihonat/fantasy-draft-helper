
import React from 'react';
import { Player } from '../services/api';

interface RecommendationDisplayProps {
  recommendation: Player | null;
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendation }) => {
  if (!recommendation) {
    return <div className="recommendation">Calculating recommendation...</div>;
  }

  return (
    <div className="recommendation">
      <h2>Recommended Pick</h2>
      <p>{recommendation.full_name} ({recommendation.position} - {recommendation.team})</p>
      <p>ADP: {recommendation.adp}</p>
    </div>
  );
};

export default RecommendationDisplay;