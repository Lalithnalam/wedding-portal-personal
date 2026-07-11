const mongoose = require('mongoose');
const { isEmojiOnly } = require('../utils/validators');

const submissionSchema = new mongoose.Schema({
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  side: {
    type: String,
    enum: ['Bride Side', 'Groom Side'],
    required: [true, 'Side is required']
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    trim: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  blessingMeter: {
    type: Number,
    required: [true, 'Blessing meter rating is required'],
    min: 1,
    max: 5
  },
  wishes: {
    type: String,
    required: [true, 'Wishes are required'],
    trim: true,
    minlength: [5, 'Wishes must be at least 5 characters long']
  },
  marriageDos: {
    type: String,
    required: [true, "Marriage Do's are required"],
    trim: true
  },
  marriageDonts: {
    type: String,
    required: [true, "Marriage Don'ts are required"],
    trim: true
  },
  favoriteMemory: {
    type: String,
    trim: true,
    default: ''
  },
  predictions: {
    type: [String],
    default: []
  },
  customPrediction: {
    type: String,
    trim: true,
    default: ''
  },
  additionalMessage: {
    type: String,
    trim: true,
    default: ''
  },
  voiceNoteUrl: {
    type: String,
    default: ''
  },
  photoUrls: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 3'],
    default: []
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Helper for photo limit
function arrayLimit(val) {
  return val.length <= 3;
}

// Pre-save check rejecting emoji-only or empty (after trim) values
submissionSchema.pre('save', function() {
  const fieldsToCheck = ['wishes', 'marriageDos', 'marriageDonts'];
  
  for (let field of fieldsToCheck) {
    if (this[field]) {
      if (this[field].trim() === '') {
        throw new Error(`${field} cannot be empty or only spaces`);
      }
      if (isEmojiOnly(this[field])) {
        throw new Error(`${field} cannot contain only emojis. Please write a meaningful message.`);
      }
    }
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
