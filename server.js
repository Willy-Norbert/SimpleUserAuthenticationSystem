const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db"); 
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const authMiddleware = (req, res, next) => {
    console.log("Cookies received:", req.cookies);
    const token = req.cookies?.token;
    if (!token) {
        console.log("No token found, redirecting to login");
        return res.redirect("/");
    }
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        console.log("Invalid token, redirecting to login");
        res.redirect("/");
    }
};

function isValidToken(token) {
    try {
        jwt.verify(token, JWT_SECRET);
        return true;
    } catch (err) {
        console.error("Token verification failed:", err.message);
        return false;
    }
}

app.get("/register", (req, res) => res.render("register"));

app.post("/register", async (req, res) => {
    const { username, password, confirmPassword, email } = req.body;
    if (!username || !password || !confirmPassword || !email) {
        return res.render("register", { error: "All fields are required" });
    }
    if (password !== confirmPassword) {
        return res.render("register", { error: "Passwords do not match" });
    }
    try {
        const userExists = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userExists.rows.length > 0) {
            return res.render("register", { error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (username, password, email) VALUES ($1, $2, $3)", [username, hashedPassword, email]);
        res.redirect("/");
    } catch (error) {
        console.error("Register Error:", error.message);
        res.render("register", { error: "Server error" });
    }
});

app.get("/", (req, res) => res.render("login"));

app.post("/", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.render("login", { error: "All fields are required" });
    }
    try {
        const user = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (user.rows.length === 0) {
            return res.render("login", { error: "Invalid username or password" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.rows[0].password);
        if (!isPasswordCorrect) {
            return res.render("login", { error: "Invalid username or password" });
        }
        const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/profile");
    } catch (error) {
        console.error("Login Error:", error.message);
        res.render("login", { error: "Server error" });
    }
});

app.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await db.query("SELECT username, email FROM users WHERE id = $1", [req.user.userId]);
        res.render("profile", { user: user.rows[0] });
    } catch (error) {
        res.redirect("/");
    }
});

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

const resetTokens = new Map();

app.get("/forgot-password", (req, res) => res.render("forgot-password", { error: null, success: null }));

app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.render("forgot-password", { error: "Email not found", success: null });
        }
        const token = crypto.randomBytes(32).toString("hex");
        resetTokens.set(token, { email, expires: Date.now() + 3600000 });
        const resetLink = `https://simpleuserauthenticationsystem.onrender.com/reset-password/${token}`;
        await transporter.sendMail({
            from: EMAIL_USER,
            to: email,
            subject: "Password Reset",
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`
        });
        res.render("forgot-password", { success: "Password reset link sent", error: null });
    } catch (error) {
        res.render("forgot-password", { error: "Server error", success: null });
    }
});

app.get("/reset-password/:token", (req, res) => {
    const { token } = req.params;
    
    if (!resetTokens.has(token) || resetTokens.get(token).expires < Date.now()) {
        return res.render("reset-password", { token: null, error: "Invalid or expired token" });
    }
    
    res.render("reset-password", { token });
});



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
        resetTokens.delete(token);
        res.redirect("/");

    } catch (error) {
        res.render("reset-password", { error: "Server error" });
    }
});


app.listen(5000, () => console.log("Server running on http://localhost:5000"));
