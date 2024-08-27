import { promises as fs } from 'fs';
import path from 'path';
import { Player } from '../models/Player';
import { scrapeFantasyProsRankings, PlayerRanking } from './fpScraperService';

export async function getPlayers(): Promise<Player[]> {
  try {
    const [fileData, fantasyProsRankings] = await Promise.all([
      readPlayerFile(),
      scrapeFantasyProsRankings().catch(error => {
        console.error('Error scraping FantasyPros rankings:', error);
        return [] as PlayerRanking[];
      })
    ]);

    const rankingsMap = new Map(fantasyProsRankings.map((r: PlayerRanking) => [r.name, r]));

    const players = Object.values(fileData) as any[];
    
    const mergedPlayers: Player[] = players
      .filter(player => player.position && player.team)
      .map(player => {
        const ranking = rankingsMap.get(player.full_name);
        return {
          player_id: player.player_id,
          full_name: player.full_name,
          position: player.position,
          team: player.team_abbr,
          adp: ranking ? ranking.rank : 9999,
          rank: player.search_rank || 9999,
          cbs_adp: player.cbs_adp || null,
          sleeper_adp: player.sleeper_adp || null,
          rtsports_adp: player.rtsports_adp || null
        };
      });

    // Add defenses
    const defenses: Player[] = [
      "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills",
      "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns",
      "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers",
      "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs",
      "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins",
      "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants",
      "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers",
      "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Commanders"
    ].map((name, index) => {
      const ranking = rankingsMap.get(name + " DST");
      return {
        player_id: `DEF${index + 1}`,
        full_name: name,
        position: "DEF",
        team: name,
        adp: ranking ? ranking.rank : 9999,
        rank: ranking ? ranking.rank : 9999,
        cbs_adp: null,
        sleeper_adp: null,
        rtsports_adp: null
      };
    });

    const allPlayers = [...mergedPlayers, ...defenses]
      .sort((a, b) => a.adp - b.adp)
      .slice(0, 400);

    console.log('Number of players:', allPlayers.length);
    return allPlayers;
  } catch (error) {
    console.error('Error processing players:', error);
    throw error;
  }
}

async function readPlayerFile(): Promise<any> {
  const filePath = path.join(__dirname, 'all_nfl_players.json');
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