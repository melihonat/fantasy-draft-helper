import express from 'express';
import { getPlayers, Player } from '../services/sleeperService';
import { getRecommendation, updatePositionalNeed } from '../services/recommendationService';

const router = express.Router();

let allPlayers: Player[] = [];

router.get('/players', async (req, res) => {
  try {
    if (allPlayers.length === 0) {
      allPlayers = await getPlayers();
    }
    res.json(allPlayers);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching players' });
  }
});

router.post('/recommendation', async (req, res) => {
  try {
    const { draftedPlayers, rosterSize } = req.body;

    if (allPlayers.length === 0) {
      allPlayers = await getPlayers();
    }

    const availablePlayers = allPlayers.filter(
      player => !draftedPlayers.some((dp: Player) => dp.player_id === player.player_id)
    );

    const positionalNeed = updatePositionalNeed(draftedPlayers, rosterSize);

    const recommendation = getRecommendation(availablePlayers, draftedPlayers, positionalNeed);

    res.json({ recommendation });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the recommendation' });
  }
});

export default router;