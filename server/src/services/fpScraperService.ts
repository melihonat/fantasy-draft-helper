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
    const response = await axios.get('https://www.fantasypros.com/nfl/rankings/ppr-cheatsheets.php', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('Response received from FantasyPros');
    console.log('Response status:', response.status);
    console.log('Response data length:', response.data.length);
    
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
    if (rankings.length === 0) {
      console.log('No rankings found. HTML structure:');
      console.log($.html('#ranking-table').slice(0, 500) + '...'); // Log first 500 characters of the table HTML
    }
    return rankings;
  } catch (error) {
    console.error('Error fetching FantasyPros rankings:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
    return [];
  }
}
