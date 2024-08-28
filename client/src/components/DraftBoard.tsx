import React from 'react';
import { DraftState, Player, LeagueSettings } from '../services/api';

interface DraftBoardProps {
  draftState: DraftState;
  leagueSettings: LeagueSettings;
}

const DraftBoard: React.FC<DraftBoardProps> = ({ draftState, leagueSettings }) => {
  type RosterSlotKey = 'QB' | 'RB' | 'WR' | 'TE' | 'FLEX' | 'K' | 'DEF' | 'BN';
  const renderRosterSlot = (player: Player | null, position: string) => (
    <li key={player?.player_id || position} className="text-sm bg-nfl-white bg-opacity-10 rounded p-2">
      {player ? (
        <>
          <span className="font-semibold">{player.full_name}</span>
          <span className="text-nfl-gray ml-2">({player.position} - {player.team})</span>
          <span className="text-nfl-red ml-2">ADP: {player.adp.toFixed(1)}</span>
          <span className="text-nfl-yellow ml-2">Pick: {player.draftPickNumber}</span>
        </>
      ) : (
        <span className="text-nfl-gray">{position}</span>
      )}
    </li>
  );

  const renderTeamRoster = (team: { id: number; players: Player[] }) => {
    const rosterSlots: Record<RosterSlotKey, (Player | null)[]> = {
      QB: Array(leagueSettings.qbSlots).fill(null),
      RB: Array(leagueSettings.rbSlots).fill(null),
      WR: Array(leagueSettings.wrSlots).fill(null),
      TE: Array(leagueSettings.teSlots).fill(null),
      FLEX: Array(leagueSettings.flexSlots).fill(null),
      K: Array(leagueSettings.kSlots).fill(null),
      DEF: Array(leagueSettings.defSlots).fill(null),
      BN: Array(leagueSettings.benchSlots).fill(null)
    };
  
    team.players.forEach(player => {
      const slot = player.slot as RosterSlotKey | undefined;
      if (slot && slot in rosterSlots) {
        const availableSlot = rosterSlots[slot].findIndex(s => s === null);
        if (availableSlot !== -1) {
          rosterSlots[slot][availableSlot] = player;
        } else {
          // If no slot available, put in bench
          const benchSlot = rosterSlots.BN.findIndex(s => s === null);
          if (benchSlot !== -1) {
            rosterSlots.BN[benchSlot] = player;
          }
        }
      } else {
        // If no slot assigned or invalid slot, try to put in appropriate position or bench
        const positionSlot = rosterSlots[player.position as RosterSlotKey]?.findIndex(s => s === null) ?? -1;
        if (positionSlot !== -1) {
          rosterSlots[player.position as RosterSlotKey][positionSlot] = player;
        } else {
          const benchSlot = rosterSlots.BN.findIndex(s => s === null);
          if (benchSlot !== -1) {
            rosterSlots.BN[benchSlot] = player;
          }
        }
      }
    });
  
    return (
      <div key={team.id} className="team-draft bg-nfl-gray bg-opacity-10 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-2 text-nfl-white">Team {team.id}</h3>
        {(Object.entries(rosterSlots) as [RosterSlotKey, (Player | null)[]][]).map(([position, players]) => (
          <div key={position}>
            <h4 className="text-lg font-semibold mt-2">{position}</h4>
            <ul className="space-y-2">
              {players.map((player, index) => renderRosterSlot(player, `${position}${index + 1}`))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="draft-board space-y-4">
      {draftState.teams.map(renderTeamRoster)}
    </div>
  );
};

export default DraftBoard;