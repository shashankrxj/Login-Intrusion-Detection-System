const bcrypt = require("bcryptjs");
const User = require("../models/model");
const LoginActivity = require('../models/LoginActivity'); // Ensure this model is created

// When user signup for the first time
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if the username already exists in the database
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                message: "Username already taken. Please choose a different username."
            });
        }

        // Check if the email already exists in the database
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                message: "Email is already associated with another account. Please use a different email."
            });
        }

        // Password validation (at least 8 characters, one special character, one uppercase letter)
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/; // At least one uppercase, one special character, and 8 characters
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long, contain at least one uppercase letter, and one special character."
            });
        }

        // Create a new user
        const newUser = new User({
            username,
            email,
            password
        });
        
        // Generate Tokens
        const token = await newUser.generateAuthToken();

        // Save token as a cookie
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 600000),
            httpOnly: true,
            secure: true, // Only sent over HTTPS
            sameSite: 'none' // Allows cross-origin cookies
        });
        console.log(token);

        // Save the user to the database
        await newUser.save();

        // Log the signup event
        await LoginActivity.create({
            username,
            timestamp: new Date(),
            status: "Signup successful",
            expiresAt: new Date(Date.now() + 1 * 60 * 1000), // Set expiresAt to 1 minute from now
        });

        // Construct the JSON data
        const jsonData = {
            message: "User created successfully",
            user: newUser
        };
        console.log("Successfully signed up");

        // Render the signup page with embedded JSON data
        return res.status(201).render("sign_page", { jsonData: JSON.stringify(jsonData) });
    } catch (error) {
        // Handle validation errors
        if (error.errors) {
            let validationErrors = [];

            if (error.errors.username && error.errors.password) {
                validationErrors.push("Username must be at least 3 characters long and Password must be at least 8 characters long");
            } else {
                if (error.errors.username) {
                    validationErrors.push(error.errors.username.message);
                }
                if (error.errors.password) {
                    validationErrors.push(error.errors.password.message);
                }
            }

            return res.status(400).json({ message: "Validation failed", errors: validationErrors });
        }

        // Return generic internal server error for other errors
        console.error("Error in signup:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// In controller.js (Login Logic)
// Updated login function
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        // Log for admin if user not found
        if (!user) {
            await LoginActivity.create({
                username: username || "Unknown",
                timestamp: new Date(),
                status: "Login failed: User not found",
                expiresAt: new Date(Date.now() + 1 * 60 * 1000),
            });
            return res.status(400).send("Invalid credentials");
        }

        // If the user is locked out, prevent login attempts
        if (user.lockUntil && user.lockUntil > new Date()) {
            const timeLeft = Math.ceil((user.lockUntil - new Date()) / 1000);
            await LoginActivity.create({
                username,
                timestamp: new Date(),
                status: `Login failed: User locked out. Time remaining: ${timeLeft}s`,
                expiresAt: new Date(Date.now() + 1 * 60 * 1000),
            });
            return res.status(400).send(`Account is locked. Try again in ${timeLeft} seconds.`);
        }

        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            user.failedAttempts += 1;

            // Lock the user if attempts exceed 3
            if (user.failedAttempts >= 3) {
                user.lockUntil = new Date(Date.now() + 1 * 60 * 1000); // Lock for 1 minute
                await user.save();

                // Log the failed login attempt
                await LoginActivity.create({
                    username,
                    timestamp: new Date(),
                    status: "Login failed: User locked after 3 attempts",
                    expiresAt: user.lockUntil,
                });

                return res.status(400).send("Account locked due to multiple failed login attempts. Try again in 1 minute.");
            }

            await user.save();

            // Log the failed login attempt
            await LoginActivity.create({
                username,
                timestamp: new Date(),
                status: `Login failed: Incorrect password. Attempts remaining: ${3 - user.failedAttempts}`,
                expiresAt: new Date(Date.now() + 1 * 60 * 1000),
            });

            return res.status(400).send(`Invalid credentials. ${3 - user.failedAttempts} attempts remaining.`);
        }

        // Reset failed attempts on successful login
        user.failedAttempts = 0;
        user.lockUntil = null;
        await user.save();

        // Log the successful login
        await LoginActivity.create({
            username,
            timestamp: new Date(),
            status: "Login successful",
            expiresAt: new Date(Date.now() + 1 * 60 * 1000),
        });

        // Proceed with the login process (e.g., creating a token)
        const token = await user.generateAuthToken();
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 600000),
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });

        res.redirect("/login"); // Adjust the redirect as needed
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal server error");
    }
};


// When user logs out
exports.logout = async (req, res) => {
    try {
        // This will logout the user from all devices
        req.user.tokens = [];

        // Deletion of cookie from browser's cookies storage
        res.clearCookie("jwt");
        await req.user.save();
        
        // Log the logout event
        await LoginActivity.create({
            username: req.user.username,
            timestamp: new Date(),
            status: "Logout successful",
            expiresAt: new Date(Date.now() + 1 * 60 * 1000), // Set expiresAt to 1 minute from now
        });

        console.log("Logout successful");
        res.redirect("/");
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).send(error);
    }
};

// This function will delete logs older than 1 minute
const cleanUpLogs = async () => {
    try {
        const result = await LoginActivity.deleteMany({ expiresAt: { $lt: new Date() } });
        console.log(`Cleaned up ${result.deletedCount} expired log entries.`);
    } catch (error) {
        console.error("Error cleaning up expired logs:", error);
    }
};

// Set interval to run cleanup every minute (60000 ms)
setInterval(cleanUpLogs, 60 * 1000); // Run every 60 seconds (1 minute)
