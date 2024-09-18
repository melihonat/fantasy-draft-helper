import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

interface PlayerRanking {
  rank: number;
  name: string;
  position: string;
  team: string;
  tier: number;
}

export async function scrapeFantasyProsRankings(): Promise<PlayerRanking[]> {
    console.log('Starting to scrape FantasyPros rankings with Puppeteer...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    try {
      await page.goto('https://www.fantasypros.com/nfl/rankings/ppr-cheatsheets.php', { waitUntil: 'networkidle0' });
      console.log('Page loaded. Extracting rankings...');
  
      const rankings = await page.evaluate(() => {
        const ecrData = (window as any).ecrData;
        if (!ecrData || !ecrData.players) {
          throw new Error('ecrData not found or invalid');
        }
  
        return ecrData.players.slice(0,400).map((player: any) => {
          let name = player.player_name;
          let position = player.player_position_id;
          let team = player.player_team_id;
  
          // Handle team defenses
          if (position === 'DST') {
            name = `${team} ${name}`;
            team = name;
          }
  
          return {
            rank: player.rank_ecr,
            name: name,
            position: position,
            team: team,
            tier: player.tier
          };
        });
      });
  
      console.log(`Scraped ${rankings.length} player rankings`);
      return rankings;
    } finally {
      await browser.close();
    }
  }

async function main() {
  try {
    const rankings = await scrapeFantasyProsRankings();
    const filePath = path.join(__dirname, '..', 'data', 'fantasyProsRankings.json');
    await fs.writeFile(filePath, JSON.stringify(rankings, null, 2));
    console.log(`Rankings saved to ${filePath}`);
  } catch (error) {
    console.error('Error scraping rankings:', error);
  }
}

main();