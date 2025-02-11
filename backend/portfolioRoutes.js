const express = require("express");
const db = require("./db");
const { verify } = require("jsonwebtoken");
const verifyToken = require("./middleware");
const { getCryptoPrice } = require("./cryptoService");

const router = express.Router();

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