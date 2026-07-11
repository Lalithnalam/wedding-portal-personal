const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => {
    console.error('MongoDB Connection Error: ', err);
    process.exit(1);
});

// API Routes
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/admin', require('./routes/admin'));

// Serve Static Frontend (the main guest portal)
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve Static Admin Dashboard
// Assuming dashboard files will be in ../admin-dashboard
app.use('/admin', express.static(path.join(__dirname, '../admin-dashboard')));

// Server static files logic is fully handled by express.static above.

// Start Server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log("Server running on port " + PORT);
    });
}

// Export for Vercel serverless functions
module.exports = app;
