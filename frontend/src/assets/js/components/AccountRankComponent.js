export class AccountRankComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.renderLoading();
    }

    set data(rankData) {
        this.render(rankData);
    }

    set error(msg) {
        this.shadowRoot.innerHTML = `
            <div class="text-red-600 p-2 text-center">${msg}</div>
        `;
    }

    renderLoading() {
        this.shadowRoot.innerHTML = `<div class="animate-pulse text-gray-400">Cargando rango...</div>`;
    }

    render(rankData) {
        if (!rankData) return this.renderLoading();
        this.shadowRoot.innerHTML = `
            <div class="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <div class="text-blue-700 font-bold text-lg mb-2">${rankData.tier} ${rankData.rank} (${rankData.leaguePoints} LP)</div>
                <div class="text-gray-700 text-sm">Victorias: <b>${rankData.wins}</b> / Derrotas: <b>${rankData.losses}</b></div>
                <div class="text-xs text-gray-400 mt-2">${rankData.queueType}</div>
            </div>
        `;
    }
}

customElements.define('account-rank', AccountRankComponent);