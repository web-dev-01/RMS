import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  areaDesc: {
    type: String,
    required: true,
    trim: true
  }
});

const infoSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  event: {
    type: String,
    required: true,
    trim: true
  },
  urgency: {
    type: String,
    required: true,
    trim: true,
    enum: ['Immediate', 'Expected', 'Future', 'Past', 'Unknown']
  },
  severity: {
    type: String,
    required: true,
    trim: true,
    enum: ['Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown']
  },
  certainty: {
    type: String,
    required: true,
    trim: true,
    enum: ['Observed', 'Likely', 'Possible', 'Unlikely', 'Unknown']
  },
  headline: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  effective: {
    type: Date,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  area: [areaSchema]
});

const capAlertSchema = new mongoose.Schema({
  stationCode: {
    type: String,
    required: true,
    trim: true
  },
  identifier: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  sender: {
    type: String,
    required: true,
    trim: true
  },
  sent: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    trim: true,
    enum: ['Actual', 'Exercise', 'System', 'Test', 'Draft']
  },
  msgType: {
    type: String,
    required: true,
    trim: true,
    enum: ['Alert', 'Update', 'Cancel', 'Ack', 'Error']
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  scope: {
    type: String,
    required: true,
    trim: true,
    enum: ['Public', 'Restricted', 'Private']
  },
  info: infoSchema
}, {
  timestamps: true
});

export const CapAlert = mongoose.models.CapAlert || mongoose.model('CapAlert', capAlertSchema);