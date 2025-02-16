const express = require("express");
const db = require("./db");
const verifyToken = require("./middleware");

const router = express.Router();

// ✅ Registrar una Compra/Venta de Criptomoneda
router.post("/add", verifyToken, async (req, res) => {
    const { crypto_symbol, amount, price, type } = req.body;

    if (!crypto_symbol || !amount || !price || !type) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (type !== "buy" && type !== "sell") {
        return res.status(400).json({ message: "Invalid transaction type" });
    }

    try {
        await db.promise().query(
            "INSERT INTO transactions (user_id, crypto_symbol, amount, price, type) VALUES (?, ?, ?, ?, ?)",
            [req.user.id, crypto_symbol.toUpperCase(), amount, price, type]
        );

        res.status(201).json({ message: "Transaction added successfully" });
    } catch (error) {
        console.error("🔥 Error adding transaction:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ Obtener el Historial de Transacciones del Usuario
router.get("/", verifyToken, async (req, res) => {
    try {
        const [transactions] = await db.promise().query(
            "SELECT id, crypto_symbol, amount, price, type, transaction_date FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC",
            [req.user.id]
        );

        res.status(200).json({ transactions });
    } catch (error) {
        console.error("🔥 Error fetching transactions:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
