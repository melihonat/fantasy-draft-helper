import { Player } from '../services/sleeperService';
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

    team.players.push(player);
    this.draftedPlayers.push(player);
    this.currentPick++;

    // Implement snake draft logic
    if (this.currentPick > this.settings.teamCount * this.settings.rosterSize) {
      throw new Error('Draft is complete');
    }
  }

  getCurrentTeam(): Team {
    const roundNumber = Math.ceil(this.currentPick / this.settings.teamCount);
    const pickInRound = (this.currentPick - 1) % this.settings.teamCount;
    const teamIndex = roundNumber % 2 === 1 ? pickInRound : this.settings.teamCount - 1 - pickInRound;
    return this.teams[teamIndex];
  }
}