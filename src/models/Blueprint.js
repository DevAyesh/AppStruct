const mongoose = require('mongoose');

const blueprintSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  ideaInput: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['web', 'mobile', 'both']
  },
  generatedMarkdown: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for common queries
blueprintSchema.index({ userId: 1, createdAt: -1 });

const Blueprint = mongoose.model('Blueprint', blueprintSchema);

module.exports = Blueprint;
