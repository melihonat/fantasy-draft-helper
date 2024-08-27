import { Player } from './sleeperService';
import { LeagueSettings } from '../models/LeagueSettings';

interface PositionalNeed {
  [key: string]: number;
}

export function getRecommendation(
  availablePlayers: Player[],
  draftedPlayers: Player[],
  positionalNeed: PositionalNeed,
  leagueSettings: LeagueSettings
): Player {
  const sortedPlayers = availablePlayers.sort((a, b) => a.adp - b.adp);

  const playerValues = sortedPlayers.map(player => ({
    ...player,
    value: calculateValue(player, positionalNeed, leagueSettings)
  }));

  return playerValues.reduce((best, current) => 
    current.value > best.value ? current : best
  , playerValues[0]);
}

function calculateValue(player: Player, positionalNeed: PositionalNeed, leagueSettings: LeagueSettings): number {
  const adpValue = 1 / (player.adp || 1000);
  const needValue = positionalNeed[player.position] || 0;
  const scoringValue = getScoringValue(player, leagueSettings);
  return adpValue + needValue + scoringValue;
}

function getScoringValue(player: Player, leagueSettings: LeagueSettings): number {
  // Implement logic to calculate player value based on league scoring settings
  // This is a simplified example
  switch (player.position) {
    case 'QB':
      return leagueSettings.passingTouchdownPoints * 0.1;
    case 'RB':
    case 'WR':
      return leagueSettings.rushingTouchdownPoints * 0.1;
    case 'TE':
      return leagueSettings.receptionPoints * 0.5;
    default:
      return 0;
  }
}

export function updatePositionalNeed(
  draftedPlayers: Player[],
  leagueSettings: LeagueSettings
): PositionalNeed {
  const positionCounts: PositionalNeed = {
    QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0
  };

  draftedPlayers.forEach(player => {
    if (positionCounts[player.position] !== undefined) {
      positionCounts[player.position]++;
    }
  });

  const remainingPicks = leagueSettings.rosterSize - draftedPlayers.length;

  return {
    QB: Math.max(0, leagueSettings.qbSlots - positionCounts.QB) / remainingPicks,
    RB: Math.max(0, leagueSettings.rbSlots - positionCounts.RB) / remainingPicks,
    WR: Math.max(0, leagueSettings.wrSlots - positionCounts.WR) / remainingPicks,
    TE: Math.max(0, leagueSettings.teSlots - positionCounts.TE) / remainingPicks,
    K: Math.max(0, leagueSettings.kSlots - positionCounts.K) / remainingPicks,
    DEF: Math.max(0, leagueSettings.defSlots - positionCounts.DEF) / remainingPicks,
  };
}