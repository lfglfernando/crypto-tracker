const express = require("express");
const db = require("./db");
const { verify } = require("jsonwebtoken");
const verifyToken = require("./middleware");
const { getCryptoPrice } = require("./cryptoService");

const router = express.Router();

// ✅ Calcular Ganancias y Pérdidas del Usuario
router.get("/profit-loss", verifyToken, async (req, res) => {
    try {
        // Obtener las transacciones del usuario
        const [transactions] = await db.promise().query(
            "SELECT crypto_symbol, amount, price, type FROM transactions WHERE user_id = ?",
            [req.user.id]
        );

        if (transactions.length === 0) {
            return res.status(200).json({ message: "No transactions found", profit_loss: 0 });
        }

        let holdings = {}; // Almacenará el precio promedio de compra
        let totalProfitLoss = 0;

        for (let tx of transactions) {
            const symbol = tx.crypto_symbol.toUpperCase();

            if (!holdings[symbol]) {
                holdings[symbol] = { totalAmount: 0, totalCost: 0 };
            }

            if (tx.type === "buy") {
                holdings[symbol].totalAmount += tx.amount;
                holdings[symbol].totalCost += tx.amount * tx.price;
            } else if (tx.type === "sell") {
                holdings[symbol].totalAmount -= tx.amount;
                holdings[symbol].totalCost -= tx.amount * tx.price;
            }
        }

        let profitLossDetails = [];

        for (let symbol in holdings) {
            if (holdings[symbol].totalAmount > 0) {
                const avgBuyPrice = holdings[symbol].totalCost / holdings[symbol].totalAmount;
                const currentPrice = await getCryptoPrice(symbol);
                const currentValue = holdings[symbol].totalAmount * currentPrice;
                const profitLoss = currentValue - holdings[symbol].totalCost;

                totalProfitLoss += profitLoss;

                profitLossDetails.push({
                    crypto_symbol: symbol,
                    amount: holdings[symbol].totalAmount,
                    avg_buy_price: avgBuyPrice.toFixed(2),
                    current_price: currentPrice,
                    current_value: currentValue.toFixed(2),
                    profit_loss: profitLoss.toFixed(2),
                });
            }
        }

        res.status(200).json({ total_profit_loss: totalProfitLoss.toFixed(2), details: profitLossDetails });
    } catch (error) {
        console.error("🔥 Error calculating profit/loss:", error);
        res.status(500).json({ message: "Server Error" });
    }
});


//Agregar Criptomoneda al Portafolio
router.post("/add", verifyToken, async (req, res) => {
    const { crypto_symbol, amount } = req.body;

    if (!crypto_symbol || !amount) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        await db.promise().query(
            "INSERT INTO portfolio (user_id, crypto_symbol, amount) VALUES (?, ?, ?)",
            [req.user.id, crypto_symbol.toUpperCase(), amount]
        );

        res.status(201).json({ message: "Crypto added to portfolio" });
    } catch (error) {
        console.error("🔥 Error adding crypto:", error);
        res.status(500).json({ message: "Serve Error" });
    }
});

router.get("/", verifyToken, async (req, res) => {
    try {
        const [portfolio] = await db.promise().query(
            "SELECT id, crypto_symbol, amount, purchased_at FROM portfolio WHERE user_id = ?",
            [req.user.id]
        );
    } catch (error) {
        console.error("🔥 Error fetching portfolio:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

//Eliminar una Criptomoneda del Portafolio
router.delete("/remove/:id", verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.promise().query(
            "DELET FROM portfolio WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Crypto not found" });
        }

        res.status(200).json({ message: "Crypto removed from portfolio" });
    } catch (error) {
        console.error("🔥 Error removing crypto:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ Obtener el Valor Actual del Portafolio
router.get("/value", verifyToken, async (req, res) => {
    try {
        // Obtener las criptomonedas del usuario
        const [portfolio] = await db.promise().query(
            "SELECT crypto_symbol, amount FROM portfolio WHERE user_id = ?",
            [req.user.id]
        );

        if (portfolio.length === 0) {
            return res.status(200).json({ message: "Portfolio is empty", total_value: 0 });
        }

        let totalValue = 0;
        let updatedPortfolio = [];

        for (let asset of portfolio) {
            const price = await getCryptoPrice(asset.crypto_symbol);

            if (price !== null) {
                const value = asset.amount * price;
                totalValue += value;

                updatedPortfolio.push({
                    crypto_symbol: asset.crypto_symbol,
                    amount: asset.amount,
                    price_per_unit: price,
                    total_value: value
                });
            }
        }

        res.status(200).json({ total_value: totalValue, portfolio: updatedPortfolio });
    } catch (error) {
        console.error("🔥 Error fetching portfolio value:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;