// authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./userModel');

// Secret key for JWT
const JWT_SECRET = 'secret_key';

// Signup route
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    console.log('Received signup request for email:', email);

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('User already exists');
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword
        });

        await newUser.save();

        console.log('User registered successfully');
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Received login request for email:', email);

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log('Invalid password');
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

        console.log('Login successful');
        res.json({ token });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
