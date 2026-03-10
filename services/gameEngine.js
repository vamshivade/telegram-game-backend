const GameSession = require('../models/GameSession');
const User = require('../models/User');

const activeGames = {};

const startGameLoop = (userId, sessionId, gameId, amount) => {
    if (activeGames[userId]) return;

    activeGames[userId] = {
        sessionId,
        gameId,
        amount,
        logs: [],
        startTime: Date.now(),
        interval: setInterval(async () => {
            await playRound(userId);
        }, 2000)
    };

    // Auto-stop after 5 minutes
    setTimeout(() => {
        if (activeGames[userId]) {
            stopGameLoop(userId);
        }
    }, 5 * 60 * 1000);
};

const playRound = async (userId) => {
    const game = activeGames[userId];
    if (!game) return;

    try {
        const user = await User.findById(userId);
        if (!user || user.balance < game.amount) {
            console.log(`User ${userId} has insufficient balance or not found. Stopping game.`);
            stopGameLoop(userId);
            return;
        }

        // 1. Deduct bet for this specific round
        user.balance -= game.amount;

        // 2. Calculate result
        const win = Math.random() > 0.5;
        const result = win ? 'win' : 'loss';
        const payout = win ? game.amount * 2 : 0;

        // 3. Add payout back to balance
        if (win) {
            user.balance += payout;
        }
        await user.save();

        const logEntry = {
            time: new Date().toLocaleTimeString(),
            result,
            payout
        };

        game.logs.unshift(logEntry);
        if (game.logs.length > 10) game.logs.pop();

        // Update session log in DB (optional, but good for persistence)
        await GameSession.findByIdAndUpdate(game.sessionId, {
            $push: { logs: { $each: [logEntry], $position: 0, $slice: 10 } }
        });
    } catch (err) {
        console.error('Error in playRound:', err);
    }
};

const stopGameLoop = async (userId) => {
    const game = activeGames[userId];
    if (!game) return null;

    clearInterval(game.interval);

    // Calculate final result based on the last round or total?
    // The requirement says "bot plays continuously".
    // Let's settle the last round results to the user balance.
    // To make it simple: each round's result is added to balance at the end.

    // Total payout from all rounds? Or just the current bet?
    // Usually, games like this treat each interval as a separate bet or one continuous game.
    // Let's assume the "Stop" button claims the LAST round's win.

    const lastRound = game.logs[0];
    const finalResult = lastRound ? lastRound.result : 'none';

    const session = await GameSession.findById(game.sessionId);
    session.status = 'completed';
    session.result = finalResult;
    session.multiplier = finalResult === 'win' ? 2 : 0;
    await session.save();

    // Note: User balance is already updated in playRound for each interval
    // We only need to finalize the session state here.

    const summary = {
        sessionId: game.sessionId,
        result: finalResult,
        logs: game.logs
    };

    delete activeGames[userId];
    return summary;
};

const isUserPlaying = (userId) => !!activeGames[userId];

const getGameStatus = (userId) => {
    const game = activeGames[userId];
    if (!game) return null;
    return {
        playing: true,
        sessionId: game.sessionId,
        gameId: game.gameId,
        amount: game.amount,
        logs: game.logs
    };
};

module.exports = {
    startGameLoop,
    stopGameLoop,
    isUserPlaying,
    getGameStatus
};
