const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { upload } = require('../utils/cloudinary');
const { sendSubmissionEmail } = require('../utils/mailer');

// Middleware to handle Multer upload for multipart/form-data
// voiceNote: max 1 file
// photos: max 3 files
const cpUpload = upload.fields([
    { name: 'voiceNote', maxCount: 1 }, 
    { name: 'photos', maxCount: 3 }
]);

/**
 * @route   POST /api/submissions
 * @desc    Submit a new guest wish
 * @access  Public
 */
router.post('/', cpUpload, async (req, res) => {
    try {
        const {
            guestName,
            side,
            relationship,
            isAnonymous,
            blessingMeter,
            wishes,
            marriageDos,
            marriageDonts,
            favoriteMemory,
            predictions,
            customPrediction,
            additionalMessage
        } = req.body;

        // Parse predictions back to array if it's sent as a string (from FormData)
        let parsedPredictions = [];
        if (predictions) {
            try {
                parsedPredictions = JSON.parse(predictions);
            } catch (e) {
                // If it's just a comma separated string or array
                parsedPredictions = Array.isArray(predictions) ? predictions : predictions.split(',');
            }
        }

        // Get Cloudinary URLs from multer req.files
        let voiceNoteUrl = '';
        if (req.files && req.files['voiceNote'] && req.files['voiceNote'].length > 0) {
            voiceNoteUrl = req.files['voiceNote'][0].path; // Cloudinary returns the secure URL in the 'path' property
        }

        let photoUrls = [];
        if (req.files && req.files['photos'] && req.files['photos'].length > 0) {
            photoUrls = req.files['photos'].map(file => file.path);
        }

        // Create new Submission instance
        const newSubmission = new Submission({
            guestName,
            side,
            relationship,
            isAnonymous: isAnonymous === 'true' || isAnonymous === true,
            blessingMeter: Number(blessingMeter),
            wishes,
            marriageDos,
            marriageDonts,
            favoriteMemory,
            predictions: parsedPredictions,
            customPrediction,
            additionalMessage,
            voiceNoteUrl,
            photoUrls
        });

        // Save to DB (this runs the Mongoose validators including the emoji check)
        const savedSubmission = await newSubmission.save();

        // Send Email asynchronously (do not await so response isn't delayed if SMTP is slow)
        sendSubmissionEmail(savedSubmission).catch(console.error);

        res.status(201).json({
            success: true,
            message: 'Wish submitted successfully!',
            data: {
                guestName: savedSubmission.guestName,
                isAnonymous: savedSubmission.isAnonymous
            }
        });

    } catch (error) {
        console.error("Submission Error: ", error);
        
        // Handle Mongoose Validation Errors gracefully
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: messages
            });
        }

        // General Server Error
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not process submission'
        });
    }
});

module.exports = router;
