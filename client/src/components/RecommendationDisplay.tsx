import React, { useState, useEffect } from 'react';
import { Player, DraftState, LeagueSettings } from '../services/api';

interface RecommendationDisplayProps {
  recommendations: (Player & { value: number })[] | null;
  draftState: DraftState | null;
  leagueSettings: LeagueSettings | null;
}

interface ESPNPlayer {
  id: string;
  team: string;
  position: string;
  fullName: string;
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendations, draftState, leagueSettings }) => {
  const [espnPlayers, setEspnPlayers] = useState<ESPNPlayer[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/espn_player_ids.json')
      .then(response => response.json())
      .then((data: ESPNPlayer[]) => {
        setEspnPlayers(data);
      })
      .catch(error => console.error('Error loading ESPN player IDs:', error));
  }, []);

  if (!recommendations || !draftState) {
    return <div className="text-nfl-white text-center">No recommendations available</div>;
  }

  const lastDraftedPlayer = draftState.draftedPlayers[draftState.draftedPlayers.length - 1];
  const lastPickingTeamId = draftState.currentPick > 1 ?
    (Math.ceil((draftState.currentPick - 1) / draftState.teams.length) % 2 === 1
      ? ((draftState.currentPick - 2) % draftState.teams.length) + 1
      : draftState.teams.length - ((draftState.currentPick - 2) % draftState.teams.length))
    : draftState.teams.length;
  const lastPickingTeamName = leagueSettings?.teamNames[lastPickingTeamId - 1];

  const getPlayerImageUrl = (player: Player) => {
    console.log(`Getting image URL for player: ${player.full_name} (${player.position})`);
    
    // Normalize names for comparison
    const normalizedPlayerName = player.full_name.toLowerCase().replace(/[^a-z]/g, '');
    
    const espnPlayer = espnPlayers.find(ep => {
      const normalizedEspnName = ep.fullName.toLowerCase().replace(/[^a-z]/g, '');
      return normalizedEspnName === normalizedPlayerName && ep.position === player.position;
    });
    
    if (espnPlayer) {
      console.log(`Found matching ESPN player: ${espnPlayer.fullName} (ID: ${espnPlayer.id})`);
    } else {
      console.log(`No exact match found. Searching for partial matches...`);
      const partialMatches = espnPlayers.filter(ep => 
        ep.fullName.toLowerCase().includes(normalizedPlayerName) || 
        normalizedPlayerName.includes(ep.fullName.toLowerCase().replace(/[^a-z]/g, ''))
      );
      console.log(`Found ${partialMatches.length} partial matches:`, partialMatches);
    }
    
    const espnApiUrl = espnPlayer ? `https://a.espncdn.com/i/headshots/nfl/players/full/${espnPlayer.id}.png` : '';
    const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.full_name)}&background=random&color=fff&size=200`;
    
    const finalUrl = espnApiUrl || placeholderUrl;
    console.log(`Using image URL: ${finalUrl}`);
    return finalUrl;
  };

  return (
    <div className="recommendation">
      <h2 className="text-xl font-bold mb-4 text-nfl-white text-center">Top Recommended Picks</h2>
      {recommendations.map((player, index) => (
        <div key={player.player_id} className="mb-4 p-3 bg-nfl-white bg-opacity-10 rounded-lg flex items-center">
          <img 
            src={getPlayerImageUrl(player)} 
            alt={player.full_name}
            className="w-16 h-16 object-cover rounded-full ml-5"
            onError={(e) => {
              console.log("Error loading image for:", player.full_name);
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.full_name)}&background=random&color=fff&size=64`;
            }}
          />
          <div className="flex-grow">
            <p className="font-semibold text-nfl-white text-center">
              {index + 1}. {player.full_name} ({player.position} - {player.team})
            </p>
            <p className="text-yellow-400 text-center">Recommendation Score: {player.value?.toFixed(1) ?? "N/A"}%</p>
            <p className="text-nfl-gray text-center">ADP: {player.adp?.toFixed(1) ?? "N/A"}</p>
          </div>
        </div>
      ))}
      
      <h3 className="text-lg font-bold mt-6 mb-2 text-nfl-white text-center">Last Drafted Player</h3>
      {lastDraftedPlayer && (
        <div className="p-3 bg-nfl-white bg-opacity-10 rounded-lg flex items-center justify-center">
          <img 
            src={getPlayerImageUrl(lastDraftedPlayer)} 
            alt={lastDraftedPlayer.full_name}
            className="w-16 h-16 object-cover rounded-full mr-4"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lastDraftedPlayer.full_name)}&background=random&color=fff&size=64`;
            }}
          />
          <div className="text-center">
            <p className="text-nfl-white">
              {lastDraftedPlayer.full_name} ({lastDraftedPlayer.position} - {lastDraftedPlayer.team})
            </p>
            <p className="text-nfl-gray">Drafted by {lastPickingTeamName}</p>
          </div>
        </div>
      )}
      
      <p className="mt-4 text-nfl-white text-center">Current Pick: {draftState.currentPick}</p>
    </div>
  );
};

export default RecommendationDisplay;