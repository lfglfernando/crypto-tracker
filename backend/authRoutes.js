const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();
const SECRET_KEY = "supersecreto";


const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified; //Guarda los datos del usuario en `req.user`
        next(); //Continua con la ejecucion de la siguiente funcion
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};

//Registro de Usuario
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });

    }

    try {
        //Verificar si el usuario ya existe
        const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email already in use" });
        }

        //Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        //Insertar nuevo usuario
        await db.promise().query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword]);

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error"});
    }

});

//Inicio de Sesion
router.post("/login", async (req, res) => {
    const { email, password } = req.body;


    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required"});
    } 

    try {
        //Buscar usuario por email
        const [user] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);

        if (user.length === 0) {
            return res.status(400).json({ message: "Incorrect email or password" });
        }

        const validPassword = await bcrypt.compare(password, user[0].password);

        if (!validPassword) {
            return res.status(400).json({ message: "Incorrect email or password" });
        }

        //Crear token JWT
        const token = jwt.sign({ id: user[0].id, email: user[0].email}, SECRET_KEY, { expiresIn: "1h" });

        res.status(200).json({ message: "Login succesful", token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error"})
    }
});

router.get("/profile", verifyToken, async (req, res) => {
    try {
        //Obtener datos del usuario autenticado
        const [user] = await db.promise().query("SELECT id, username, email, created_at FROM users WHERE id = ?", [req.user.id]);

        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: user[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;