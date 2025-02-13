const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db"); // Database connection
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv"); // Import dotenv

require("dotenv").config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

const JWT_SECRET = "your_secret_key";

const authMiddleware = (req, res, next) => {
    console.log("Cookies received:", req.cookies); // Debugging

    const token = req.cookies?.token; // Safely check if cookies exist
    if (!token) {
        console.log("No token found, redirecting to login");
        return res.redirect("/login");
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        console.log("Invalid token, redirecting to login");
        res.redirect("/login");
    }
};

const cookieParser = require("cookie-parser");
app.use(cookieParser());



app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    const { username, password, confirmPassword, email } = req.body;
    console.log("Received Registration Data:", req.body); // Debugging

    if (!username || !password || !confirmPassword || !email) {
        return res.render("register", { error: "All fields are required" });
    }
    
    if (password !== confirmPassword) {
        return res.render("register", { error: "Passwords do not match" });
    }

    try {
        const userExists = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        console.log("User Exists Check:", userExists.rows); // Debugging

        if (userExists.rows.length > 0) {
            return res.render("register", { error: "User already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (username, password, email) VALUES ($1, $2, $3)", 
                       [username, hashedPassword, email]);
        
        console.log("User Registered Successfully");
        res.redirect("/login");
    } catch (error) {
        console.error("Register Error:", error.message); // Debugging
        res.render("register", { error: "Server error" });
    }
});



app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log("Login Attempt:", username, password); // Debugging

    if (!username || !password) {
        return res.render("login", { error: "All fields are required" });
    }

    try {
        const user = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        console.log("User Query Result:", user.rows); // Debugging

        if (user.rows.length === 0) {
            console.log("User Not Found");
            return res.render("login", { error: "Invalid username or password" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.rows[0].password);
        console.log("Password Match:", isPasswordCorrect); // Debugging

        if (!isPasswordCorrect) {
            return res.render("login", { error: "Invalid username or password" });
        }

        const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: "1h" });
        console.log("Generated Token:", token); // Debugging

        res.cookie("token", token, { httpOnly: true });
        return res.redirect("/profile");
    } catch (error) {
        console.error("Login Error:", error.message); // Debugging
        return res.render("login", { error: "Server error" });
    }
});


app.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await db.query("SELECT username, email FROM users WHERE id = $1", [req.user.userId]);
        res.render("profile", { user: user.rows[0] });
    } catch (error) {
        res.redirect("/login");
    }
});
app.get("/logout", (req, res) => {
    res.clearCookie("token"); // Remove JWT token from cookies
    res.redirect("/login"); // Redirect to login page
});

// Configure Nodemailer (Replace with your email details)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

// Store reset tokens temporarily (You can use the database instead)
const resetTokens = new Map();

/** 
 * Forgot Password - Send Reset Email 
 */
/** 
 * Forgot Password - Show Forgot Password Form 
 */
app.get("/forgot-password", (req, res) => {
    res.render("forgot-password", { error: null, success: null });
});


app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.render("forgot-password", { error: "Email not found", success: null });
        }
        console.log(user); // Log the user object to ensure you're getting the expected data

        // Generate Reset Token
        const token = crypto.randomBytes(32).toString("hex");
        resetTokens.set(token, { email, expires: Date.now() + 3600000 }); // 1 hour expiration

        // Send Email
        const resetLink = `http://localhost:5000/reset-password/${token}`;
        await transporter.sendMail({
            from: "willynorbert53@gmail.com",
            to: email,
            subject: "Password Reset",
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
        });

        // Success message with error as null
        res.render("forgot-password", { success: "Password reset link sent to your email.", error: null });

    } catch (error) {
        res.render("forgot-password", { error: "Server error", success: null });
    }
});


app.get("/reset-password/:token", (req, res) => {
    const { token } = req.params;

    // Assuming you are validating the token here
    if (!isValidToken(token)) {
        return res.render("reset-password", { token, error: "Invalid or expired token" });
    }

    // Render the page without an error if the token is valid
    res.render("reset-password", { token });
});



/** 
 * Reset Password - Update Password 
 */
app.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!resetTokens.has(token) || resetTokens.get(token).expires < Date.now()) {
        return res.render("reset-password", { error: "Invalid or expired token" });
    }

    if (!password || !confirmPassword || password !== confirmPassword) {
        return res.render("reset-password", { error: "Passwords do not match" });
    }

    try {
        const email = resetTokens.get(token).email;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);

        resetTokens.delete(token); // Remove token after use
        res.redirect("/login");

    } catch (error) {
        res.render("reset-password", { error: "Server error" });
    }
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

