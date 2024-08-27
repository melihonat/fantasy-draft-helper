export interface Player {
    player_id: string;
    full_name: string;
    position: string;
    team: string;
    adp: number;
    rank: number;
    cbs_adp: number | null;
    sleeper_adp: number | null;
    rtsports_adp: number | null;
  }