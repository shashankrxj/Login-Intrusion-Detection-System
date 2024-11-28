const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

// Create the model
const LoginActivity = mongoose.model("LoginActivity", loginActivitySchema);
module.exports = LoginActivity;
