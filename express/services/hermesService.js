const axios = require('axios');
const Wish = require('../models/wish');
const Round = require('../models/round');

class HermesService {
    constructor() {
        this.client = axios.create({
            baseURL: process.env.HERMES_API_URL,
            headers: {
                'Authorization': `Bearer ${process.env.HERMES_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async getContext(newWish, userId) {
        // Get recent wishes
        const recentWishes = await Wish.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('content createdAt');

        // Get current round info
        const currentRound = await Round.findCurrentRound();
        const timeToNextRound = currentRound ? this.calculateTimeToNextRound(currentRound) : null;

        // Build context object
        return {
            new_wish: {
                content: newWish.content,
                timestamp: new Date().toISOString()
            },
            recent_wishes: recentWishes.map(w => ({
                content: w.content,
                timestamp: w.createdAt
            })),
            round_context: {
                current_wishes: currentRound?.currentWishes || 0,
                required_wishes: currentRound?.requiredWishes || 0,
                time_to_next_round: timeToNextRound,
                status: currentRound?.status
            },
            // Chat context could be added here in future
        };
    }

    calculateTimeToNextRound(round) {
        if (round.status === 'completed') return 0;
        
        const now = new Date();
        const roundType = round.type;
        let timeLeft;

        if (roundType === 'fast') {
            // Fast rounds last 1 hour from creation
            const endTime = new Date(round.createdAt);
            endTime.setHours(endTime.getHours() + 1);
            timeLeft = endTime - now;
        } else if (roundType === 'daily') {
            // Daily rounds last 24 hours
            const endTime = new Date(round.createdAt);
            endTime.setHours(endTime.getHours() + 24);
            timeLeft = endTime - now;
        }

        return Math.max(0, Math.floor(timeLeft / 1000)); // Return seconds remaining
    }

    async analyzeWish(context) {
        try {
            const response = await this.client.post('/analyze', {
                context,
                config: {
                    role: "Make-A-Wish Game Assistant",
                    purpose: "Analyze wish context and provide insights",
                    tone: "friendly and encouraging"
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error calling Hermes-nous API:', error);
            throw new Error('Failed to analyze wish with Hermes-nous');
        }
    }
}

module.exports = new HermesService();
