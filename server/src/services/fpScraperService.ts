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
    let currentTier = 0;

    $('tr.player-row.mpb-player__tr.mpb-player__tr--taken').each((index, element) => {
      const $el = $(element);
      
      const rankCell = $el.find('td.sticky-cell.sticky-cell-one.mpb-player__border--taken');
      const rank = parseInt(rankCell.text().trim(), 10);
      
      const playerCell = $el.find('td.player-cell');
      const name = playerCell.find('a.player-name').text().trim();
      const teamAndPos = playerCell.find('span.player-team-position').text().trim().split(' ');
      const team = teamAndPos[0].replace('(', '').replace(')', '');
      const position = teamAndPos[1];

      // Find the closest previous tier row
      let tierRow = $el.prev('tr.tier-row');
      let $currentEl = $el;
      while (tierRow.length === 0 && $currentEl.prev().length > 0) {
        $currentEl = $currentEl.prev();
        tierRow = $currentEl.prev('tr.tier-row');
      }
      const tier = tierRow.length ? parseInt(tierRow.find('.tier-name').text().replace('Tier', '').trim(), 10) : currentTier;
      currentTier = tier;

      if (rank && name) {
        rankings.push({ rank, name, team, position, tier });
      }
    });

    console.log(`Fetched ${rankings.length} player rankings`);
    if (rankings.length === 0) {
      console.log('No rankings found. HTML structure:');
      console.log($.html('table#ranking-table').slice(0, 500) + '...'); // Log first 500 characters of the table HTML
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