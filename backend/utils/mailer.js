const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Sends an email notification with the submission details.
 * @param {Object} submission - The saved submission document
 */
const sendSubmissionEmail = async (submission) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail || !process.env.EMAIL_USER) {
            console.warn("Email credentials missing in .env. Skipping email notification.");
            return;
        }

        const guestDisplayName = submission.isAnonymous ? "Anonymous Guest" : submission.guestName;
        
        let photoAttachments = '';
        if (submission.photoUrls && submission.photoUrls.length > 0) {
            photoAttachments = submission.photoUrls.map((url, index) => 
                `<li><a href="${url}" target="_blank">View Photo ${index + 1}</a></li>`
            ).join('');
            photoAttachments = `<ul>${photoAttachments}</ul>`;
        } else {
            photoAttachments = "No photos submitted";
        }

        let voiceAttachment = submission.voiceNoteUrl ? 
            `<a href="${submission.voiceNoteUrl}" target="_blank">Play Voice Note</a>` : 
            "No voice note submitted";

        let predictionsStr = submission.predictions && submission.predictions.length > 0 
            ? submission.predictions.join(', ') 
            : "None selected";

        const htmlBody = `
            <div style="font-family: 'Georgia', serif; color: #3e4a42; max-width: 600px; margin: 0 auto; background-color: #FFFDF7; border: 1px solid #F2D5D5; padding: 30px; border-radius: 10px;">
                
                <div style="text-align: center; border-bottom: 2px solid #F2D5D5; padding-bottom: 20px; margin-bottom: 20px;">
                    <h1 style="color: #9CB4A6; font-size: 24px; margin: 0;">New Wedding Wish</h1>
                    <p style="font-size: 16px; font-style: italic; margin-top: 5px;">From ${guestDisplayName}</p>
                </div>

                <div style="background-color: rgba(242, 213, 213, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: #5a6b60; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Guest Details</h3>
                    <p><strong>Guest Name:</strong> ${submission.isAnonymous ? "Anonymous" : submission.guestName}</p>
                    <p><strong>Bride/Groom Side:</strong> ${submission.side}</p>
                    <p><strong>Relationship to Couple:</strong> ${submission.relationship}</p>
                    <p><strong>Anonymous Preference:</strong> ${submission.isAnonymous ? "Yes" : "No"}</p>
                    <p><strong>Blessing Meter Rating:</strong> ${submission.blessingMeter} out of 5</p>
                </div>

                <div style="background-color: rgba(156, 180, 166, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: #5a6b60; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Words of Wisdom</h3>
                    <p><strong>Wishes:</strong><br/>${submission.wishes}</p>
                    <p><strong>What the couple should definitely do:</strong><br/>${submission.marriageDos}</p>
                    <p><strong>What the couple should avoid:</strong><br/>${submission.marriageDonts}</p>
                    <p><strong>Favorite Memory:</strong><br/>${submission.favoriteMemory || "Not provided"}</p>
                </div>

                <div style="background-color: rgba(212, 175, 55, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: #5a6b60; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Fun Predictions</h3>
                    <p><strong>Predictions Selected:</strong> ${predictionsStr}</p>
                    <p><strong>Custom Prediction:</strong> ${submission.customPrediction || "None"}</p>
                    <p><strong>Additional Message:</strong><br/>${submission.additionalMessage || "None"}</p>
                </div>

                <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eee;">
                    <h3 style="margin-top: 0; color: #5a6b60; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Attachments</h3>
                    <p><strong>Voice Note:</strong> ${voiceAttachment}</p>
                    <p><strong>Photos:</strong><br/>${photoAttachments}</p>
                </div>

                <div style="text-align: center; font-size: 12px; color: #8c9c93; margin-top: 30px;">
                    <p>Submitted At: ${new Date(submission.submittedAt).toLocaleString()}</p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmail,
            subject: `New Wedding Wish from ${guestDisplayName}`,
            html: htmlBody
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully: ", info.messageId);

    } catch (error) {
        console.error("Error sending submission email: ", error);
        // We catch and log, but don't crash the API response if email fails
    }
};

module.exports = { sendSubmissionEmail };
