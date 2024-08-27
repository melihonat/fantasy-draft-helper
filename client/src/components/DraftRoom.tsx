
import React, { useState, useEffect } from 'react';
import { Player, api, LeagueSettings, DraftState } from '../services/api';
import { PlayerList, DraftBoard, RecommendationDisplay } from './';
import LeagueSetup from './LeagueSetup';

const DraftRoom: React.FC = () => {
  const [leagueSettings, setLeagueSettings] = useState<LeagueSettings | null>(null);
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [recommendation, setRecommendation] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendation = async () => {
      if (draftState && leagueSettings) {
        try {
          const currentTeamId = draftState.teams[draftState.currentPick % draftState.teams.length].id;
          const { recommendation } = await api.getRecommendation(currentTeamId);
          setRecommendation(recommendation);
        } catch (error) {
          console.error('Failed to fetch recommendation:', error);
        }
      }
    };

    fetchRecommendation();
  }, [draftState, leagueSettings]);

  const handleSettingsSubmit = async (settings: LeagueSettings) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.setLeagueSettings(settings);
      setLeagueSettings(settings);
      
      const players = await api.getPlayers();
      setAvailablePlayers(players);
      
      const state = await api.getDraftState();
      setDraftState(state);
    } catch (error) {
      console.error('Failed to set up league and fetch initial data:', error);
      setError('Failed to set up league. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const draftPlayer = async (player: Player) => {
    if (draftState) {
      try {
        const currentTeamId = Math.floor((draftState.currentPick - 1) / draftState.teams.length) % 2 === 0
          ? (draftState.currentPick - 1) % draftState.teams.length + 1
          : draftState.teams.length - (draftState.currentPick - 1) % draftState.teams.length;
          
        const updatedState = await api.draftPlayer(player.player_id, currentTeamId);
        setDraftState(updatedState);
        setAvailablePlayers(availablePlayers.filter(p => p.player_id !== player.player_id));
      } catch (error) {
        console.error('Failed to draft player:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!leagueSettings) {
    return <LeagueSetup onSettingsSubmit={handleSettingsSubmit} />;
  }

  return (
    <div className="draft-room">
      <h1>Fantasy Football Draft Room</h1>
      <div className="draft-content">
        <PlayerList players={availablePlayers} onDraft={draftPlayer} />
        {draftState && <DraftBoard draftState={draftState} />}
        <RecommendationDisplay recommendation={recommendation} />
      </div>
    </div>
  );
};

export default DraftRoom;