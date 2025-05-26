import {AccountProfile} from '../../domain/model/AccountProfile.js';

export class AccountProfileService {
	constructor(accountRepository) {
		this.accountRepository = accountRepository;
	}

	async getFullProfile({gameName, tagLine, region}) {
		const basic = await this.accountRepository.getByRiotId(gameName, tagLine, region);
		const details = await this.accountRepository.getDetailsByPUUID(basic.puuid, region);

		return new AccountProfile({
			gameName: basic.gameName,
			tagLine: basic.tagLine,
			puuid: basic.puuid,
			summonerId: details.summonerId,
			profileIconId: details.profileIconId,
			summonerLevel: details.summonerLevel,
			region
		});
	}
}