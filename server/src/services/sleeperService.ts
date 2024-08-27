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
  console.log("Attempting to read file:", filePath);

  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    console.log('File read successfully');

    const playersData = JSON.parse(fileContent);
    console.log('Number of players in raw data:', Object.keys(playersData).length);
    
    const players = Object.values(playersData) as any[];
    // Debug: Log the first player to see its structure
    console.log('Sample player data:', players[0]);

    // Count players with each property
    const withPosition = players.filter(player => player.position).length;
    const withTeam = players.filter(player => player.team).length;
    const withRank = players.filter(player => player.search_rank).length;
    console.log(`Players with position: ${withPosition}`);
    console.log(`Players with team: ${withTeam}`);
    console.log(`Players with rank: ${withRank}`);

    const filteredPlayers = players
      .filter(player => player.position && player.search_rank && player.team)
      .map(player => ({
        player_id: player.player_id,
        full_name: player.full_name,
        position: player.position,
        team: player.team_abbr,
        adp: player.search_rank // Using rank as a proxy for ADP
      }))
      .sort((a, b) => a.adp - b.adp)
      .slice(0, 400);

    console.log('Number of filtered players:', filteredPlayers.length);
    return filteredPlayers;
  } catch (error) {
    console.error('Error reading or processing players file:', error);
    throw error;
  }
}

export async function getADP(): Promise<{ [key: string]: number }> {
  const response = await axios.get(`${SLEEPER_API_BASE_URL}/players/nfl/trending/add?lookback_hours=168&limit=300`);
  return response.data.reduce((acc: { [key: string]: number }, player: any) => {
    acc[player.player_id] = player.rank;
    return acc;
  }, {});
}