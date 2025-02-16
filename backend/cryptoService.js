const axios = require("axios");

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";

const getCoinGeckoId = (symbol) => {
    const mapping = {
        BTC: "bitcoin",
        ETH: "ethereum",
        ADA: "cardano",
        USDT: "tether",
        BNB: "binancecoin",
        XRP: "ripple",
        DOGE: "dogecoin",
        DOT: "polkadot",
        LTC: "litecoin"
        // Agregar más si es necesario
    };
    return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
};

const getCryptoPrice = async (symbol) => {
    try {
        const coinGeckoId = getCoinGeckoId(symbol);
        console.log(`🔎 Buscando precio para: ${coinGeckoId}`); // Depuración

        const response = await axios.get(COINGECKO_API_URL, {
            params: {
                ids: coinGeckoId,
                vs_currencies: "usd"
            }
        });

        console.log(`✅ Respuesta de CoinGecko para ${coinGeckoId}:`, response.data);

        return response.data[coinGeckoId]?.usd || null;
    } catch (error) {
        console.error("🔥 Error fetching crypto price:", error);
        return null;
    }
};

module.exports = { getCryptoPrice };
