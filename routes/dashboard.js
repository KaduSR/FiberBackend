// routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authenticate = require("../middleware/authenticate");

router.get("/overview", authenticate, dashboardController.getDashboard);

module.exports = router;
