import Account from '../domain/account.js';
import { fetchAccountByRiotId } from '../infra/riotApi.js';

export async function getAccountByRiotId(gameName, tagLine) {
    const data = await fetchAccountByRiotId(gameName, tagLine);
    return new Account(data);
}