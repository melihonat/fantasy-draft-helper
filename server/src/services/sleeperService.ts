import axios from 'axios';
import {promises as fs} from 'fs';
import path from 'path';

const SLEEPER_API_BASE_URL = 'https://api.sleeper.app/v1';

export interface Player {
  player_id: string;
  full_name: string;
  position: string;
  team: string;
  adp: number;
}

export async function getPlayers(): Promise<Player[]> {
  const filePath = path.join(__dirname, 'all_nfl_players.json');

  const fileContent = await fs.readFile(filePath, 'utf8');

  const playersData = JSON.parse(fileContent);
  
  const players = Object.values(playersData) as any[];
  return players
    .filter(player => player.position && player.team && player.rank)
    .map(player => ({
      player_id: player.player_id,
      full_name: player.full_name,
      position: player.position,
      team: player.team,
      adp: player.search_rank // Using rank as a proxy for ADP
    }))
    .sort((a, b) => a.adp - b.adp)
    .slice(0, 200); // Limiting to top 200 players for performance
}

export async function getADP(): Promise<{ [key: string]: number }> {
  const response = await axios.get(`${SLEEPER_API_BASE_URL}/players/nfl/trending/add?lookback_hours=168&limit=300`);
  return response.data.reduce((acc: { [key: string]: number }, player: any) => {
    acc[player.player_id] = player.rank;
    return acc;
  }, {});
}