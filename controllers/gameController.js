const GameSession = require('../models/GameSession');
const User = require('../models/User');
const gameEngine = require('../services/gameEngine');

const startGame = async (req, res) => {
    const { gameId, amount } = req.body;

    try {
        const user = await User.findById(req.userId);
        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        if (gameEngine.isUserPlaying(req.userId)) {
            return res.status(400).json({ message: 'Game already in progress' });
        }

        // Create session (deduction will happen in the first playRound loop)
        const session = new GameSession({
            userId: req.userId,
            gameId,
            betAmount: amount,
            status: 'playing'
        });
        await session.save();

        // Start loop
        gameEngine.startGameLoop(req.userId, session._id, gameId, amount);

        res.json({ sessionId: session._id, balance: user.balance });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const stopGame = async (req, res) => {
    try {
        const result = await gameEngine.stopGameLoop(req.userId);
        if (!result) {
            return res.status(400).json({ message: 'No active game found' });
        }
        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getStatus = async (req, res) => {
    const status = gameEngine.getGameStatus(req.userId);
    res.json(status || { playing: false });
};

module.exports = {
    startGame,
    stopGame,
    getStatus
};
