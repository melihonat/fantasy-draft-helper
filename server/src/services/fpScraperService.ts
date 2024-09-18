import fs from 'fs/promises'
import path from 'path'

export interface PlayerRanking {
  rank: number;
  name: string;
  position: string;
  team: string;
  tier: number;
}

export async function getFantasyProsRankings(): Promise<PlayerRanking[]> {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'fantasyProsRankings.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as PlayerRanking[];
  } catch (error) {
    console.error('Error reading rankings file:', error);
    return [];
  }
}