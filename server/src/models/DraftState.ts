import { Player } from './Player';
import { LeagueSettings } from './LeagueSettings';

interface Team {
  id: number;
  players: Player[];
}

export class DraftState {
  teams: Team[];
  currentPick: number;
  draftedPlayers: Player[];
  settings: LeagueSettings;

  constructor(settings: LeagueSettings) {
    this.settings = settings;
    this.teams = Array.from({ length: settings.teamCount }, (_, i) => ({ id: i + 1, players: [] }));
    this.currentPick = 1;
    this.draftedPlayers = [];
  }

  draftPlayer(player: Player, teamId: number) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) throw new Error('Invalid team ID');
  
    const slot = this.determinePlayerSlot(player, team);
    if (slot === null) {
      throw new Error(`Cannot draft ${player.full_name} to team ${team.id}`);
    }
  
    const draftedPlayer = { ...player, slot, draftPickNumber: this.currentPick };
    team.players.push(draftedPlayer);
    this.draftedPlayers.push(draftedPlayer);
    this.currentPick++;
  
    this.optimizeTeamRoster(team);

    if (this.teams.every(team => team.players.length >= this.settings.rosterSize)) {
      throw new Error('Draft is complete');
    }
  }

  optimizeTeamRoster(team: Team) {
    const sortedPlayers = team.players.sort((a, b) => a.adp - b.adp);
    const newRoster: Player[] = [];
  
    for (const player of sortedPlayers) {
      const slot = this.determinePlayerSlot(player, { id: team.id, players: newRoster });
      if (slot) {
        newRoster.push({ ...player, slot });
      }
    }
  
    team.players = newRoster;
  }

  getCurrentTeamId(): number {
    const roundNumber = Math.ceil(this.currentPick / this.settings.teamCount);
    const pickInRound = (this.currentPick - 1) % this.settings.teamCount;
    return roundNumber % 2 === 1 ? pickInRound + 1 : this.settings.teamCount - pickInRound;
  }

  determinePlayerSlot(player: Player, team: Team): string | null {
    const positionCounts = {
      QB: team.players.filter(p => p.position === 'QB').length,
      RB: team.players.filter(p => p.position === 'RB').length,
      WR: team.players.filter(p => p.position === 'WR').length,
      TE: team.players.filter(p => p.position === 'TE').length,
      K: team.players.filter(p => p.position === 'K').length,
      DEF: team.players.filter(p => p.position === 'DEF').length,
      FLEX: team.players.filter(p => p.slot === 'FLEX').length,
      BN: team.players.filter(p => p.slot === 'BN').length,
    };

    const benchCount = team.players.filter(p => p.slot === 'BN').length;
  
    switch (player.position) {
      case 'QB':
        if (positionCounts.QB < this.settings.qbSlots) return 'QB';
        break;
      case 'RB':
        if (positionCounts.RB < this.settings.rbSlots) return 'RB';
        if (positionCounts.FLEX < this.settings.flexSlots && 
          positionCounts.RB + positionCounts.WR + positionCounts.TE < 
          this.settings.rbSlots + this.settings.wrSlots + this.settings.teSlots + this.settings.flexSlots) 
        return 'FLEX';
      break;
      case 'WR':
        if (positionCounts.WR < this.settings.wrSlots) return 'WR';
        if (positionCounts.FLEX < this.settings.flexSlots && 
          positionCounts.RB + positionCounts.WR + positionCounts.TE < 
          this.settings.rbSlots + this.settings.wrSlots + this.settings.teSlots + this.settings.flexSlots) 
        return 'FLEX';
      break;
      case 'TE':
        if (positionCounts.TE < this.settings.teSlots) return 'TE';
        if (positionCounts.FLEX < this.settings.flexSlots && 
          positionCounts.RB + positionCounts.WR + positionCounts.TE < 
          this.settings.rbSlots + this.settings.wrSlots + this.settings.teSlots + this.settings.flexSlots) 
        return 'FLEX';
      break;
      case 'K':
        if (positionCounts.K < this.settings.kSlots) return 'K';
        break;
      case 'DEF':
        if (positionCounts.DEF < this.settings.defSlots) return 'DEF';
        break;
    }
    if (benchCount < this.settings.benchSlots) return 'BN';
    return null;
  }
}