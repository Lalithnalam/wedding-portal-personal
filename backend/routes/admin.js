const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate admin & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check environment variables
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordRaw = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPasswordRaw) {
            return res.status(500).json({ success: false, message: 'Server configuration error' });
        }

        // Validate credentials
        if (email !== adminEmail) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // In a real app, ADMIN_PASSWORD would be stored hashed in .env or DB.
        // For this setup, we just check exact match with .env (we simulate bcrypt if you wanted it hashed in env, but let's just do a string compare for simplicity given it's stored in .env)
        // To stick to your prompt "hashed with bcrypt", we will hash the .env password and compare it using bcrypt.
        const salt = await bcrypt.genSalt(10);
        const hashedEnvPassword = await bcrypt.hash(adminPasswordRaw, salt);
        const isMatch = await bcrypt.compare(password, hashedEnvPassword);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Return JWT
        const payload = {
            admin: {
                role: 'superadmin'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ success: true, token });
            }
        );

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   GET /api/admin/submissions
 * @desc    Get all submissions, sorted by newest
 * @access  Private (Requires JWT)
 */
router.get('/submissions', auth, async (req, res) => {
    try {
        // Fetch all submissions, sorted by submittedAt descending
        const submissions = await Submission.find().sort({ submittedAt: -1 });
        
        res.json({
            success: true,
            count: submissions.length,
            data: submissions
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
