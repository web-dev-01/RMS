import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  areaDesc: {
    type: String,
    required: false,
    trim: true
  }
});

const infoSchema = new mongoose.Schema({
  category: {
    type: String,
    required: false,
    trim: true
  },
  event: {
    type: String,
    required: false,
    trim: true
  },
  urgency: {
    type: String,
    required: false,
    trim: true,
    
  },
  severity: {
    type: String,
    required: false,
    trim: true,
    
  },
  certainty: {
    type: String,
    required: false,
    trim: true,
    
  },
  headline: {
    type: String,
    required: false,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  effective: {
    type: Date,
    required: false
  },
  expires: {
    type: Date,
    required: false
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
    required: false,
    trim: true,
    
  },
  msgType: {
    type: String,
    required: false,
    trim: true,
    
  },
  source: {
    type: String,
    required: false,
    trim: true
  },
  scope: {
    type: String,
    required: false,
    trim: true,
   
  },
  info: infoSchema
}, {
  timestamps: true
});

export const CapAlert = mongoose.models.CapAlert || mongoose.model('CapAlert', capAlertSchema);