import axios from 'axios';
import '../styles/main.css';

export interface Player {
  player_id: string;
  full_name: string;
  position: string;
  slot?: string;
  draftPickNumber?: number;
  team: string;
  adp: number;
  rank: number;
  cbs_adp: number | null;
  sleeper_adp: number | null;
  rtsports_adp: number | null;
}

export interface LeagueSettings {
  teamCount: number;
  teamNames: string[];
  rosterSize: number;
  qbSlots: number;
  rbSlots: number;
  wrSlots: number;
  teSlots: number;
  flexSlots: number;
  kSlots: number;
  defSlots: number;
  benchSlots: number;
  passingTouchdownPoints: number;
  rushingTouchdownPoints: number;
  receptionPoints: number;
}

export interface DraftState {
  teams: {
    id: number;
    players: Player[];
  }[];
  currentPick: number;
  draftedPlayers: Player[];
  getCurrentTeam: () => { id: number; players: Player[] };
  isDraftComplete: boolean;
}

export interface DraftRecommendation {
  recommendation: Player;
}

export const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  getPlayers: async (): Promise<Player[]> => {
    const response = await axios.get(`${API_BASE_URL}/draft/players`);
    return response.data;
  },
  setLeagueSettings: async (settings: LeagueSettings): Promise<void> => {
    await axios.post(`${API_BASE_URL}/draft/league-settings`, settings);
  },
  getLeagueSettings: async (): Promise<LeagueSettings> => {
    const response = await axios.get(`${API_BASE_URL}/draft/league-settings`);
    return response.data;
  },
  draftPlayer: async (playerId: string, teamId: number): Promise<{ draftState: DraftState; isDraftComplete: boolean }> => {
    const response = await axios.post(`${API_BASE_URL}/draft/draft-player`, { playerId, teamId });
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return {
      draftState: response.data.draftState,
      isDraftComplete: response.data.isDraftComplete
    };
  },
  getDraftState: async (): Promise<DraftState> => {
    const response = await axios.get(`${API_BASE_URL}/draft/draft-state`);
    return response.data;
  },
  getRecommendation: async (teamId: number): Promise<DraftRecommendation> => {
    const response = await axios.post(`${API_BASE_URL}/draft/recommendation`, { teamId });
    return response.data;
  },
};