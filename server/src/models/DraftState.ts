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
    const draftedPlayer = { ...player, slot, draftPickNumber: this.currentPick };
    team.players.push(draftedPlayer);
    this.draftedPlayers.push(draftedPlayer);
    this.currentPick++;

    // Check if all teams have filled their rosters
    if (this.teams.every(team => team.players.length >= this.settings.rosterSize)) {
      throw new Error('Draft is complete');
    }
  }

  getCurrentTeam(): Team {
    const roundNumber = Math.ceil(this.currentPick / this.settings.teamCount);
    const pickInRound = (this.currentPick - 1) % this.settings.teamCount;
    const teamIndex = roundNumber % 2 === 1 ? pickInRound : this.settings.teamCount - 1 - pickInRound;
    return this.teams[teamIndex];
  }

  determinePlayerSlot(player: Player, team: Team): string {
    const positionCounts = {
      QB: team.players.filter(p => p.position === 'QB').length,
      RB: team.players.filter(p => p.position === 'RB').length,
      WR: team.players.filter(p => p.position === 'WR').length,
      TE: team.players.filter(p => p.position === 'TE').length,
      K: team.players.filter(p => p.position === 'K').length,
      DEF: team.players.filter(p => p.position === 'DEF').length,
    };
  
    switch (player.position) {
      case 'QB':
        return positionCounts.QB < this.settings.qbSlots ? 'QB' : 'BN';
      case 'RB':
        return positionCounts.RB < this.settings.rbSlots ? 'RB' : 
               (positionCounts.RB + positionCounts.WR + positionCounts.TE < 
                this.settings.rbSlots + this.settings.wrSlots + this.settings.teSlots + this.settings.flexSlots) ? 'FLEX' : 'BN';
      case 'WR':
        return positionCounts.WR < this.settings.wrSlots ? 'WR' : 
               (positionCounts.RB + positionCounts.WR + positionCounts.TE < 
                this.settings.rbSlots + this.settings.wrSlots + this.settings.teSlots + this.settings.flexSlots) ? 'FLEX' : 'BN';
      case 'TE':
        return positionCounts.TE < this.settings.teSlots ? 'TE' : 
               (positionCounts.RB + positionCounts.WR + positionCounts.TE < 
                this.settings.rbSlots + this.settings.wrSlots + this.settings.teSlots + this.settings.flexSlots) ? 'FLEX' : 'BN';
      case 'K':
        return positionCounts.K < this.settings.kSlots ? 'K' : 'BN';
      case 'DEF':
        return positionCounts.DEF < this.settings.defSlots ? 'DEF' : 'BN';
      default:
        return 'BN';
    }
  }
}