import { promises as fs } from 'fs';
import path from 'path';
import { Player } from '../models/Player';
import { getFantasyProsRankings, PlayerRanking } from './fpScraperService';

function normalizePlayerName(name: string | undefined | null): string {
  if (!name) {
    console.warn('Attempted to normalize undefined or null player name');
    return '';
  }
  // Remove suffixes and trim whitespace
  return name.replace(/\s+(Jr\.|Sr\.|II|III|IV)$/, '').trim();
}

export async function getPlayers(): Promise<Player[]> {
  try {
    const [fileData, fantasyProsRankings] = await Promise.all([
      readPlayerFile(),
      getFantasyProsRankings().catch(error => {
        console.error('Error scraping FantasyPros rankings:', error);
        return [] as PlayerRanking[];
      })
    ]);

    console.log(`Fetched ${fantasyProsRankings.length} rankings from FantasyPros`);

    const rankingsMap = new Map(fantasyProsRankings.map((r: PlayerRanking) => {
      if (!r.name) {
        console.warn('Found a FantasyPros ranking with undefined name:', r);
        return ['', r];
      }
      return [normalizePlayerName(r.name), r];
    }));

    const players = Object.values(fileData) as any[];
    
    console.log(`Loaded ${players.length} players from file`);

    console.log('Sample of players from file:');
    players.slice(0, 10).forEach((player, index) => {
      console.log(`${index + 1}. ${player.full_name} (${player.position} - ${player.team})`);
    });

    console.log('\nSample of players from FantasyPros:');
    fantasyProsRankings.slice(0, 10).forEach((player, index) => {
      console.log(`${index + 1}. ${player.name} (${player.position} - ${player.team})`);
    });

    const mergedPlayers: Player[] = players
      .filter(player => {
        if (!player.position || !player.team) {
          return false;
        }
        if (player.full_name === 'Lamar Jackson' && player.position !== 'QB') { // Filter out CB Lamar Jackson
          return false;
        }
        return true;
      })
      .map(player => {
        const normalizedName = normalizePlayerName(player.full_name);
        const ranking = rankingsMap.get(normalizedName);
        return {
          player_id: player.player_id,
          full_name: ranking ? ranking.name : player.full_name, // Use FantasyPros name if available
          position: player.position,
          team: player.team,
          adp: ranking ? ranking.rank : 9999,
          rank: player.search_rank || 9999,
          cbs_adp: player.cbs_adp || null,
          sleeper_adp: player.sleeper_adp || null,
          rtsports_adp: player.rtsports_adp || null
        };
      });

    // Add defenses
    const defenses: Player[] = fantasyProsRankings
      .filter(r => r.position === 'DST')
      .map((r, index) => ({
        player_id: `DEF${index + 1}`,
        full_name: r.name || `Unknown Defense ${index + 1}`,
        position: "DEF",
        team: r.team || 'Unknown',
        adp: r.rank,
        rank: r.rank,
        cbs_adp: null,
        sleeper_adp: null,
        rtsports_adp: null
      }));

    const allPlayers = [...mergedPlayers, ...defenses]
      .sort((a, b) => a.adp - b.adp)
      .slice(0, 400);

    console.log('\nSample of final player list:');
    allPlayers.slice(0, 10).forEach((player, index) => {
      console.log(`${index + 1}. ${player.full_name} (${player.position} - ${player.team}) - ADP: ${player.adp}`);
    });

    console.log('Number of players:', allPlayers.length);
    console.log('Number of defenses:', defenses.length);
    return allPlayers;
  } catch (error) {
    console.error('Error processing players:', error);
    throw error;
  }
}

async function readPlayerFile(): Promise<any> {
  const filePath = path.join(__dirname, '..', '..', 'src', 'services', 'all_nfl_players.json');
  console.log("Attempting to read file:", filePath);

  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    console.log('File read successfully');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading players file:', error);
    throw error;
  }
}