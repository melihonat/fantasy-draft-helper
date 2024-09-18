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
  console.log('Starting fetchFantasyProsRankings function');
  try {
    console.log('Fetching FantasyPros rankings...');
    const response = await axios.get('https://www.fantasypros.com/nfl/rankings/ppr-cheatsheets.php', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('Response received from FantasyPros');
    console.log('Response status:', response.status);
    console.log('Response data length:', response.data.length);
    
    const $ = cheerio.load(response.data);
    console.log('Cheerio loaded response data');
    
    const rankings: PlayerRanking[] = [];
    let currentTier = 0;

    console.log('Starting to parse table rows');
    $('table#ranking-table tbody tr').each((index, element) => {
      const $el = $(element);
      console.log(`Processing row ${index + 1}`);
      
      // Check if this is a tier row
      if ($el.hasClass('tier-row')) {
        const tierText = $el.find('.tier-name').text().trim();
        console.log(`Found tier row: ${tierText}`);
        currentTier = parseInt(tierText.replace('Tier', ''), 10);
        console.log(`Updated current tier to: ${currentTier}`);
        return; // Skip to next iteration
      }

      // Check if this is a player row
      if ($el.hasClass('player-row')) {
        console.log('Found player row');
        const rankCell = $el.find('td.sticky-cell.sticky-cell-one');
        const rankText = rankCell.text().trim();
        console.log(`Rank cell text: ${rankText}`);
        const rank = parseInt(rankText, 10);
        console.log(`Parsed rank: ${rank}`);
        
        const playerCell = $el.find('td.player-label');
        const name = playerCell.find('a.player-name').text().trim();
        console.log(`Player name: ${name}`);
        
        const teamPosText = playerCell.find('small').text().trim();
        console.log(`Team and position text: ${teamPosText}`);
        const teamAndPos = teamPosText.split(' ');
        const team = teamAndPos[0].replace('(', '').replace(')', '');
        const position = teamAndPos[1];
        console.log(`Team: ${team}, Position: ${position}`);

        if (rank && name) {
          console.log(`Adding player to rankings: ${name} (Rank: ${rank}, Team: ${team}, Position: ${position}, Tier: ${currentTier})`);
          rankings.push({ rank, name, team, position, tier: currentTier });
        } else {
          console.log(`Skipping player due to missing rank or name. Rank: ${rank}, Name: ${name}`);
        }
      } else {
        console.log('Row is neither tier nor player row');
      }
    });

    console.log(`Fetched ${rankings.length} player rankings`);
    if (rankings.length === 0) {
      console.log('No rankings found. HTML structure:');
      console.log($.html('table#ranking-table').slice(0, 500) + '...'); // Log first 500 characters of the table HTML
    }
    return rankings;
  } catch (error) {
    console.error('Error in fetchFantasyProsRankings:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:');
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
    return [];
  }
}