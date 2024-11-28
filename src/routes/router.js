const express = require("express");
const route = express.Router();
const services = require("../services/render");
const controller = require("../controller/controller");
const auth = require("../middleware/auth");
const LoginActivity = require('../models/LoginActivity');

/// Admin Logs Route
route.get("/admin", async (req, res) => {
    try {
        // Fetch activities that have not expired (still valid logs)
        const activities = await LoginActivity.find({ expiresAt: { $gte: new Date() } }).sort({ timestamp: -1 });

        // Render the admin page with activities
        res.render("admin", { activities });
    } catch (error) {
        console.error("Error retrieving login activities:", error);
        res.status(500).send("Internal server error");
    }
});



route.get("/", services.homeRoute);
route.get("/sign_page", services.signup)
route.get("/login", services.alreadylogin);
route.get("/admin", services.admin);

route.post("/sign_page", controller.signup);
route.post("/login", controller.login);
route.post("/logout", auth, controller.logout);



module.exports = route;
