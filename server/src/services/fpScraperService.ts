import axios from 'axios';
import * as cheerio from 'cheerio';

export interface PlayerRanking {
  rank: number;
  name: string;
  position: string;
  team: string;
  tier: number;
}

export async function fetchFantasyProsRankings(): Promise<PlayerRanking[]> {
  console.log('Fetching FantasyPros rankings...');
  try {
    const response = await axios.get('https://www.fantasypros.com/nfl/rankings/ppr-cheatsheets.php');
    const $ = cheerio.load(response.data);
    
    const rankings: PlayerRanking[] = [];
    
    $('#ranking-table tbody tr').each((index, element) => {
      const $el = $(element);
      const rank = parseInt($el.find('.rank-number').text().trim(), 10);
      const tierText = $el.find('.tier-text').text().trim();
      const tier = tierText ? parseInt(tierText.replace('Tier', ''), 10) : 0;
      const name = $el.find('.player-name').text().trim();
      const team = $el.find('.player-team').text().trim();
      const position = $el.find('.player-position').text().trim();
      
      if (rank && name) {
        rankings.push({ rank, name, team, position, tier });
      }
    });

    console.log(`Fetched ${rankings.length} player rankings`);
    return rankings;
  } catch (error) {
    console.error('Error fetching FantasyPros rankings:', error);
    return [];
  }
}

