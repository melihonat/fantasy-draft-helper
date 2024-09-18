import React, { useState, useEffect, useCallback } from 'react';
import { Player, api, LeagueSettings, DraftState } from '../services/api';
import { PlayerList, DraftBoard, RecommendationDisplay, DraftOverview } from './';
import LeagueSetup from './LeagueSetup';
import '../styles/main.css';

const DraftRoom: React.FC = () => {
  const [leagueSettings, setLeagueSettings] = useState<LeagueSettings | null>(null);
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [recommendations, setRecommendations] = useState<(Player & { value: number })[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraftComplete, setIsDraftComplete] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (draftState && leagueSettings && !isDraftComplete) {
        try {
          const currentTeamId = draftState.teams[draftState.currentPick % draftState.teams.length].id;
          const { recommendations } = await api.getRecommendations(currentTeamId);
          setRecommendations(recommendations);
        } catch (error) {
          console.error('Failed to fetch recommendations:', error);
        }
      }
    };

    fetchRecommendations();
  }, [draftState, leagueSettings, isDraftComplete]);

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
          
        const response = await api.draftPlayer(player.player_id, currentTeamId);
        setDraftState(response.draftState);
        setAvailablePlayers(availablePlayers.filter(p => p.player_id !== player.player_id));
        if (response.isDraftComplete) {
          setIsDraftComplete(true);
        }
      } catch (error) {
        console.error('Failed to draft player:', error);
        alert("Cannot draft this player, your team has too many of this player type!");
      }
    }
  };

  const handleNewDraft = useCallback(() => {
    setIsDraftComplete(false);
    setDraftState(null);
    setLeagueSettings(null);
    setAvailablePlayers([]);
    setRecommendations(null);
    setError(null);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gradient-to-br from-nfl-blue to-nfl-blue-dark">
      <div className="text-2xl font-bold text-nfl-white animate-pulse">Loading...</div>
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen bg-gradient-to-br from-nfl-blue to-nfl-blue-dark">
      <div className="text-xl font-bold text-nfl-red bg-white bg-opacity-10 rounded-lg p-6 backdrop-filter backdrop-blur-sm">Error: {error}</div>
    </div>;
  }

  if (!leagueSettings) {
    return <LeagueSetup onSettingsSubmit={handleSettingsSubmit} />;
  }

  if (isDraftComplete && draftState && leagueSettings) {
    console.log("Rendering Draft Overview");
    return <DraftOverview draftState={draftState} leagueSettings={leagueSettings} onNewDraft={handleNewDraft} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-red text-nfl-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-extrabold mb-8 text-center text-nfl-white drop-shadow-lg">
          Fantasy Football Draft Room
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-10 rounded-lg shadow-lg p-6 backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
            <h2 className="text-2xl font-bold mb-4 text-nfl-white">Available Players</h2>
            <PlayerList players={availablePlayers} onDraft={draftPlayer} />
          </div>
          {draftState && (
            <div className="bg-white bg-opacity-10 rounded-lg shadow-lg p-6 backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
              <h2 className="text-2xl font-bold mb-4 text-nfl-white">Draft Board</h2>
              <DraftBoard draftState={draftState} leagueSettings={leagueSettings} />
            </div>
          )}
          <div className="bg-white bg-opacity-10 rounded-lg shadow-lg p-6 backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
            <h2 className="text-2xl font-bold mb-4 text-nfl-white">Recommendations</h2>
            <RecommendationDisplay 
              recommendations={recommendations} 
              draftState={draftState} 
              leagueSettings={leagueSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftRoom;