import puppeteer from 'puppeteer';

export interface PlayerRanking {
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

      return ecrData.players.map((player: any) => ({
        rank: player.rank_ecr,
        name: player.player_name,
        position: player.player_position_id,
        team: player.player_team_id,
        tier: player.tier
      }));
    });

    console.log(`Scraped ${rankings.length} player rankings`);
    return rankings;
  } finally {
    await browser.close();
  }
}

