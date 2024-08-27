import { Player } from './sleeperService';

interface PositionalNeed {
  [key: string]: number;
}

export function getRecommendation(
  availablePlayers: Player[],
  draftedPlayers: Player[],
  positionalNeed: PositionalNeed
): Player {
  const sortedPlayers = availablePlayers.sort((a, b) => a.adp - b.adp);

  const playerValues = sortedPlayers.map(player => ({
    ...player,
    value: calculateValue(player, positionalNeed)
  }));

  return playerValues.reduce((best, current) => 
    current.value > best.value ? current : best
  , playerValues[0]);
}

function calculateValue(player: Player, positionalNeed: PositionalNeed): number {
  const adpValue = 1 / (player.adp || 1000); // Lower ADP is better, default to 1000 if undefined
  const needValue = positionalNeed[player.position] || 0;
  return adpValue + needValue;
}

export function updatePositionalNeed(
  draftedPlayers: Player[],
  rosterSize: number
): PositionalNeed {
  const positionCounts: PositionalNeed = {
    QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0
  };

  draftedPlayers.forEach(player => {
    if (positionCounts[player.position] !== undefined) {
      positionCounts[player.position]++;
    }
  });

  const remainingPicks = rosterSize - draftedPlayers.length;

  return {
    QB: Math.max(0, 1 - positionCounts.QB) / remainingPicks,
    RB: Math.max(0, 2 - positionCounts.RB) / remainingPicks,
    WR: Math.max(0, 2 - positionCounts.WR) / remainingPicks,
    TE: Math.max(0, 1 - positionCounts.TE) / remainingPicks,
    K: Math.max(0, 1 - positionCounts.K) / remainingPicks,
    DEF: Math.max(0, 1 - positionCounts.DEF) / remainingPicks,
  };
}