import express from 'express';
import { getPlayers } from '../services/playerService';
import { Player } from '../models/Player';
import { getRecommendation, updatePositionalNeed } from '../services/recommendationService';
import { LeagueSettings } from '../models/LeagueSettings';
import { DraftState } from '../models/DraftState';

const router = express.Router();

let allPlayers: Player[] = [];
let leagueSettings: LeagueSettings | null = null;
let draftState: DraftState | null = null;

router.get('/players', async (req, res) => {
  try {
    if (allPlayers.length === 0) {
      allPlayers = await getPlayers();
    }
    res.json(allPlayers);
  } catch (error) {
    console.error('Error retrieving players:', error);
    res.status(500).json({ message: 'Error retrieving players' });
  }
});

router.post('/league-settings', (req, res) => {
  leagueSettings = req.body as LeagueSettings;
  draftState = new DraftState(leagueSettings);
  res.json({ message: 'League settings saved successfully' });
});

router.get('/league-settings', (req, res) => {
  if (leagueSettings) {
    res.json(leagueSettings);
  } else {
    res.status(404).json({ message: 'League settings not found' });
  }
});

router.post('/draft-player', (req, res) => {
  if (!draftState) {
    return res.status(400).json({ error: 'Draft has not been initialized' });
  }

  const { playerId, teamId } = req.body;
  const player = allPlayers.find(p => p.player_id === playerId);

  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  try {
    draftState.draftPlayer(player, teamId);
    const isDraftComplete = draftState.isDraftComplete();
    console.log("Draft is complete:", isDraftComplete);
    res.json({ message: isDraftComplete ? 'Draft is complete' : 'Player drafted successfully', draftState, isDraftComplete });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/draft-state', (req, res) => {
  if (draftState) {
    res.json(draftState);
  } else {
    res.status(404).json({ message: 'Draft state not found' });
  }
});

router.post('/recommendation', (req, res) => {
  if (!draftState || !leagueSettings) {
    return res.status(400).json({ message: 'Draft has not been initialized' });
  }

  const { teamId } = req.body;
  const team = draftState.teams.find(t => t.id === teamId);

  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }

  const availablePlayers = allPlayers.filter(
    player => !draftState!.draftedPlayers.some(dp => dp.player_id === player.player_id)
  );

  const positionalNeed = updatePositionalNeed(team.players, leagueSettings);
  
  try {
    const recommendation = getRecommendation(availablePlayers, team.players, positionalNeed, leagueSettings);
    res.json({ recommendation });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router;