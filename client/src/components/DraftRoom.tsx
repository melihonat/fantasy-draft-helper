
import React, { useState, useEffect, useCallback } from 'react';
import { Player, api, LeagueSettings, DraftState } from '../services/api';
import { PlayerList, DraftBoard, RecommendationDisplay } from './';
import DraftResultsViewer from './DraftResultsViewer';
import LeagueSetup from './LeagueSetup';
import '../styles/main.css';

const DraftRoom: React.FC = () => {
  const [leagueSettings, setLeagueSettings] = useState<LeagueSettings | null>(null);
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [recommendation, setRecommendation] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraftComplete, setIsDraftComplete] = useState(false);

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
        alert(`Cannot draft this player: ${(error as Error).message}`);
      }
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-nfl-blue">
      <div className="text-2xl font-bold text-nfl-white">Loading...</div>
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen bg-nfl-blue">
      <div className="text-xl font-bold text-nfl-red">Error: {error}</div>
    </div>;
  }

  if (!leagueSettings) {
    return <LeagueSetup onSettingsSubmit={handleSettingsSubmit} />;
  }

  return (
    <div className="min-h-screen bg-nfl-blue text-nfl-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-extrabold mb-8 text-center text-nfl-white shadow-text">Fantasy Football Draft Room</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-nfl-gray bg-opacity-20 rounded-lg shadow-lg p-6 border border-nfl-white border-opacity-20">
            <h2 className="text-2xl font-bold mb-4 text-nfl-white">Available Players</h2>
            <PlayerList players={availablePlayers} onDraft={draftPlayer} />
          </div>
          {draftState && (
            <div className="bg-nfl-gray bg-opacity-20 rounded-lg shadow-lg p-6 border border-nfl-white border-opacity-20">
              <h2 className="text-2xl font-bold mb-4 text-nfl-white">Draft Board</h2>
              <DraftBoard draftState={draftState} leagueSettings={leagueSettings} />
            </div>
          )}
          <div className="bg-nfl-gray bg-opacity-20 rounded-lg shadow-lg p-6 border border-nfl-white border-opacity-20">
            <h2 className="text-2xl font-bold mb-4 text-nfl-white">Recommendation</h2>
            <RecommendationDisplay recommendation={recommendation} draftState={draftState} leagueSettings={leagueSettings}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftRoom;