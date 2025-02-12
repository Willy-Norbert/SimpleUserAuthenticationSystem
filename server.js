const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db"); // Import database configuration

const app = express();
app.use(express.json()); // Middleware to parse JSON in requests

// Secret key for JWT (Change this to a secure value in production)
const JWT_SECRET = "your_secret_key";  

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization"); // Get token from request headers

    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        // Verify token and extract user ID
        const verified = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.user = verified; // Attach user info to request object
        next(); // Continue to next function
    } catch (error) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

// 📝 REGISTER USER
app.post("/register", async (req, res) => {
    const { username, password, email } = req.body;

    // Check if all fields are provided
    if (!username || !password || !email) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if user already exists
        const userExists = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password before storing it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save new user in database
        await db.query("INSERT INTO users (username, password, email) VALUES ($1, $2, $3)", 
                       [username, hashedPassword, email]);

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 📝 LOGIN USER
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Check if all fields are provided
    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Find user in database
        const user = await db.query("SELECT * FROM users WHERE username = $1", [username]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Compare password with stored hash
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 📝 GET USER PROFILE (Protected Route)
app.get("/profile", authMiddleware, async (req, res) => {
    try {
        // Retrieve user data from database using ID from token
        const user = await db.query("SELECT id, username, email FROM users WHERE id = $1", [req.user.userId]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.rows[0]); // Send user details as response

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
