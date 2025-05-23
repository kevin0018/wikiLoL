const Account = require('../domain/account');
const { fetchAccountByRiotId } = require('../infra/riotApi');

async function getAccountByRiotId(gameName, tagLine) {
    const data = await fetchAccountByRiotId(gameName, tagLine);
    return new Account(data);
}

module.exports = { getAccountByRiotId };