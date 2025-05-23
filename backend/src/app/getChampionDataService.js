const { fetchChampionData } = require('../infra/championApi');

async function getChampionData(locale, version) {
    return await fetchChampionData(locale, version);
}

module.exports = { getChampionData };