// Check if a string is completely empty or just whitespace
const isMeaningful = (str) => {
    if (!str) return false;
    return str.trim().length > 0;
};
  
// Check if a string contains ONLY emojis (and whitespace)
const isEmojiOnly = (str) => {
    if (!str) return false;
    
    // Remove whitespace
    const noWhitespace = str.replace(/\\s+/g, '');
    if (noWhitespace.length === 0) return false;

    // Emoji regex (matches standard emojis and sequences)
    const emojiRegex = /^[\\p{Emoji}\\u200d]+$/u;
    return emojiRegex.test(noWhitespace);
};

// Validate uploaded photo file types
const validatePhotoFile = (file) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return false;
    }
    // Max 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        return false;
    }
    return true;
};
  
module.exports = {
    isMeaningful,
    isEmojiOnly,
    validatePhotoFile
};
