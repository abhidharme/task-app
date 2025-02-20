const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// User Registration
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(req.body);

        // Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
     
        // Ensure password is a string
        if (typeof password !== "string") {
            return res.status(400).json({ message: "Password must be a string" });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// User Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Exclude password from response
        const { _id, name } = user;
        
        res.json({
            message: "Login successful",
            token,
            user: {
                id: _id,
                name,
                email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Generate a 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10); // Hash OTP before storing

        user.otp = hashedOtp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
        await user.save();

        // Send OTP via email
        await transporter.sendMail({
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP is: ${otp} to reset password. It will expire in 10 minutes.`,
        });

        res.json({ message: "OTP sent to email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.otp || !user.otpExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        if (Date.now() > user.otpExpires) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        const isOtpValid = await bcrypt.compare(otp, user.otp); // Compare hashed OTP
        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
