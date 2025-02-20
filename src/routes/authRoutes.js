const express = require("express");
const { signup, login, forgotPassword, verifyOTP } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);

// Protected route example
router.get("/protected", authMiddleware, (req, res) => {
    res.json({ message: "You have access to this protected route", user: req.user });
});

module.exports = router;
