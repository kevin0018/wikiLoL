import { GetChallengerLeagueQuery } from '../app/query/GetChallengerLeagueQuery.js';

/**
 * Builds the controller for fetching Challenger league players.
 * @param {GetChallengerLeagueHandler} getChallengerLeagueHandler - The handler to execute the query.
 * @returns {Function} Express route handler.
 */
export function buildChallengerLeagueController(getChallengerLeagueHandler) {
    return async (req, res) => {
        // Default to EUW and RANKED_SOLO_5x5 if not provided, or handle as errors
        const { region = 'EUW', queue = 'RANKED_SOLO_5x5' } = req.query;

        try {
            const query = new GetChallengerLeagueQuery(String(region).toUpperCase(), String(queue));
            const players = await getChallengerLeagueHandler.execute(query);
            res.json(players);
        } catch (error) {
            console.error(`Error in ChallengerLeagueController: ${error.message}`);
            // Determine appropriate status code based on error type
            if (error.message.includes("Invalid region") || error.message.includes("is required")) {
                res.status(400).json({ error: error.message }); // Bad Request
            } else if (error.message.includes("Riot API error")) {
                res.status(502).json({ error: "Failed to fetch data from Riot API." }); // Bad Gateway
            }
            else {
                res.status(500).json({ error: "An internal server error occurred." });
            }
        }
    };
}