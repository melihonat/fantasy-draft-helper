import { Player } from '../models/Player';
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

  const remainingSlots = getRemainingSlots(draftedPlayers, leagueSettings);
  const eligiblePlayers = sortedPlayers.filter(player => remainingSlots[player.position] > 0);

  if (eligiblePlayers.length === 0) {
    throw new Error('No eligible players to draft');
  }

  const playerValues = eligiblePlayers.map(player => ({
    ...player,
    value: calculateValue(player, positionalNeed, draftedPlayers, leagueSettings)
  }));

  return playerValues.reduce((best, current) => 
    current.value > best.value ? current : best
  , playerValues[0]);
}

function getRemainingSlots(draftedPlayers: Player[], leagueSettings: LeagueSettings): Record<string, number> {
  const draftedCounts = {
    QB: draftedPlayers.filter(p => p.position === 'QB').length,
    RB: draftedPlayers.filter(p => p.position === 'RB').length,
    WR: draftedPlayers.filter(p => p.position === 'WR').length,
    TE: draftedPlayers.filter(p => p.position === 'TE').length,
    K: draftedPlayers.filter(p => p.position === 'K').length,
    DEF: draftedPlayers.filter(p => p.position === 'DEF').length,
  };

  const remainingSlots = {
    QB: Math.max(0, leagueSettings.qbSlots - draftedCounts.QB),
    RB: Math.max(0, leagueSettings.rbSlots - draftedCounts.RB),
    WR: Math.max(0, leagueSettings.wrSlots - draftedCounts.WR),
    TE: Math.max(0, leagueSettings.teSlots - draftedCounts.TE),
    K: Math.max(0, leagueSettings.kSlots - draftedCounts.K),
    DEF: Math.max(0, leagueSettings.defSlots - draftedCounts.DEF),
  };

  const flexSlots = Math.max(0, leagueSettings.flexSlots - 
    Math.max(0, draftedCounts.RB - leagueSettings.rbSlots) -
    Math.max(0, draftedCounts.WR - leagueSettings.wrSlots) -
    Math.max(0, draftedCounts.TE - leagueSettings.teSlots)
  );

  remainingSlots.RB += flexSlots;
  remainingSlots.WR += flexSlots;
  remainingSlots.TE += flexSlots;

  const benchSlots = leagueSettings.benchSlots;
  (Object.keys(remainingSlots) as Array<keyof typeof remainingSlots>).forEach(pos => {
    remainingSlots[pos] += benchSlots;
  });

  return remainingSlots;
}

function calculateValue(
  player: Player, 
  positionalNeed: PositionalNeed, 
  draftedPlayers: Player[],
  leagueSettings: LeagueSettings
): number {
  const adpValue = 1 / (player.adp || 1000);
  const needValue = positionalNeed[player.position] || 0;
  const scoringValue = getScoringValue(player, leagueSettings);
  const benchValue = getBenchValue(player, draftedPlayers, leagueSettings);
  const flexValue = getFlexValue(player, draftedPlayers, leagueSettings);

  return adpValue + needValue + scoringValue + benchValue + flexValue;
}

function getFlexValue(player: Player, draftedPlayers: Player[], leagueSettings: LeagueSettings): number {
  if (!['WR', 'RB', 'TE'].includes(player.position)) {
    return 0;
  }

  const flexPlayers = draftedPlayers.filter(p => ['WR', 'RB', 'TE'].includes(p.position));
  const flexLimit = leagueSettings.wrSlots + leagueSettings.rbSlots + leagueSettings.teSlots + leagueSettings.flexSlots;

  if (flexPlayers.length < flexLimit) {
    return 0.5; // Bonus for filling a flex spot
  }

  // Calculate flex value based on how much better this player is compared to the worst flex starter
  const worstFlexStarter = flexPlayers
    .sort((a, b) => b.adp - a.adp)[flexLimit - 1];
  
  if (!worstFlexStarter) {
    return 0;
  }
  
  return Math.max(0, (worstFlexStarter.adp - player.adp) / 2000);
}

function getBenchValue(player: Player, draftedPlayers: Player[], leagueSettings: LeagueSettings): number {
  const positionCount = draftedPlayers.filter(p => p.position === player.position).length;
  const positionLimit = getPositionLimit(player.position, leagueSettings);
  
  if (positionCount < positionLimit) {
    return 0; // Not a bench player yet
  }
  
  // Calculate bench value based on how much better this player is compared to the worst starter
  const worstStarter = draftedPlayers
    .filter(p => p.position === player.position)
    .sort((a, b) => b.adp - a.adp)[positionLimit - 1];
  
  if (!worstStarter) {
    return 0;
  }
  
  return Math.max(0, (worstStarter.adp - player.adp) / 1000);
}

function getPositionLimit(position: string, leagueSettings: LeagueSettings): number {
  switch (position) {
    case 'QB': return leagueSettings.qbSlots;
    case 'RB': return leagueSettings.rbSlots + leagueSettings.flexSlots;
    case 'WR': return leagueSettings.wrSlots + leagueSettings.flexSlots;
    case 'TE': return leagueSettings.teSlots + leagueSettings.flexSlots;
    case 'K': return leagueSettings.kSlots;
    case 'DEF': return leagueSettings.defSlots;
    default: return 0;
  }
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
    QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0, FLEX: 0
  };

  draftedPlayers.forEach(player => {
    if (positionCounts[player.position] !== undefined) {
      positionCounts[player.position]++;
    }
    if (['WR', 'RB', 'TE'].includes(player.position)) {
      positionCounts.FLEX++;
    }
  });

  const remainingPicks = leagueSettings.rosterSize - draftedPlayers.length;
  const benchSlots = leagueSettings.rosterSize - (
    leagueSettings.qbSlots +
    leagueSettings.rbSlots +
    leagueSettings.wrSlots +
    leagueSettings.teSlots +
    leagueSettings.kSlots +
    leagueSettings.defSlots +
    leagueSettings.flexSlots
  )

  const flexLimit = leagueSettings.rbSlots + leagueSettings.wrSlots + leagueSettings.teSlots + leagueSettings.flexSlots;

  return {
    QB: calculatePositionalNeedValue(positionCounts.QB, leagueSettings.qbSlots, remainingPicks, benchSlots),
    RB: calculatePositionalNeedValue(positionCounts.RB, leagueSettings.rbSlots, remainingPicks, benchSlots),
    WR: calculatePositionalNeedValue(positionCounts.WR, leagueSettings.wrSlots, remainingPicks, benchSlots),
    TE: calculatePositionalNeedValue(positionCounts.TE, leagueSettings.teSlots, remainingPicks, benchSlots),
    K: calculatePositionalNeedValue(positionCounts.K, leagueSettings.kSlots, remainingPicks, benchSlots),
    DEF: calculatePositionalNeedValue(positionCounts.DEF, leagueSettings.defSlots, remainingPicks, benchSlots),
    FLEX: calculatePositionalNeedValue(positionCounts.FLEX, flexLimit, remainingPicks, benchSlots),
  };
}

function calculatePositionalNeedValue(
  count: number, 
  slots: number, 
  remainingPicks: number, 
  benchSlots: number
): number {
  if (count < slots) {
    // High need for unfilled starting positions
    return (slots - count) / remainingPicks;
  } else if (benchSlots > 0) {
    // Lower need for bench positions
    return 0.1 / remainingPicks;
  }
  return 0;
}