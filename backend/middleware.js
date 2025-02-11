const jwt = require("jsonwebtoken");
const SECRET_KEY = "supersecreto"; // 🔹 Asegúrate de que es la misma clave usada en authRoutes.js

const verifyToken = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        console.log("🚨 No se envió token en la solicitud");
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔎 Token recibido:", token);

    if (!token) {
        console.log("🚨 El token no tiene el formato correcto");
        return res.status(401).json({ message: "Invalid token format" });
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        console.log("✅ Token válido para el usuario ID:", verified.id);
        req.user = verified;
        next();
    } catch (error) {
        console.error("🔥 Error verificando token:", error.message);
        res.status(400).json({ message: "Invalid token" });
    }
};


module.exports = verifyToken;
